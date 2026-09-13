// @ts-check
/**
 * Renderiza fenced code blocks ```mermaid como SVG em build-time.
 *
 * Roda como rehype plugin do Markdown/MDX ANTES do rehype plugin do
 * astro-expressive-code (plugins de `markdown.rehypePlugins` executam antes
 * dos plugins injetados por integrações), então o Expressive Code nunca vê o
 * bloco `mermaid` e continua processando os demais code blocks normalmente.
 *
 * Cada diagrama é renderizado DUAS vezes (tema claro e tema escuro) via
 * mermaid-isomorphic (Chromium headless do Playwright). Os dois SVGs são
 * embutidos no HTML e o global.css exibe apenas o que corresponde ao
 * `data-theme` atual — sem nenhum JavaScript no navegador.
 *
 * Cache em disco (.cache/mermaid-svg/): renderizar via Chromium é o passo
 * mais lento do build, e a maioria dos posts não muda os diagramas de posts
 * anteriores. Cada entrada é chaveada por sha256(texto do diagrama +
 * versão da config de tema), então mudar `lightConfig`/`darkConfig` abaixo
 * invalida o cache sozinho — não precisa limpar nada manualmente. O SVG já
 * é salvo otimizado por `svgo` (ids/atributos redundantes removidos), então
 * o cache também funciona como o armazenamento da versão final.
 *
 * Saída gerada:
 *   <div class="mermaid-diagram">
 *     <div class="mermaid-svg mermaid-svg-light"><svg …/></div>
 *     <div class="mermaid-svg mermaid-svg-dark"><svg …/></div>
 *   </div>
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { fromHtml } from 'hast-util-from-html';
import { createMermaidRenderer } from 'mermaid-isomorphic';
import { optimize } from 'svgo';
import { visit } from 'unist-util-visit';

/** Mesma pilha de --font-ui em global.css, para o diagrama casar com o site. */
const fontFamily = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

/**
 * mermaid-isomorphic mede o texto de cada diagrama chamando `getBBox()` de
 * verdade num Chromium headless (Playwright) pra dimensionar as caixas dos
 * nós — só que esse Chromium não tem acesso à rede nem ao @fontsource
 * self-hosted do site, então sem ajuda nenhuma ele cai no fallback
 * `arial,sans-serif` da própria lib pra fazer essa medição. O SVG gerado,
 * porém, é exibido depois num navegador real, onde a Inter (mais estreita
 * que a Arial em várias letras) carrega normalmente. Resultado: a caixa do
 * nó fica dimensionada pra Arial mas o texto real vem em Inter, cortando
 * palavras mais longas ("untagged", "Computador" etc.) nas bordas do nó.
 *
 * Corrigido embutindo a própria fonte Inter (como `data:` URI, pesos 400 e
 * 700) via `RenderOptions.css` do mermaid-isomorphic — a lib repassa isso
 * pro Playwright como `page.addStyleTag({ url: css })`, e um `data:` URI é
 * uma URL válida ali. Assim o Chromium do build mede o texto com a MESMA
 * fonte que o navegador do usuário vai usar pra exibir o resultado.
 */
const fontsDir = fileURLToPath(new URL('../node_modules/@fontsource/inter/files/', import.meta.url));
const interRegularWoff2 = readFileSync(path.join(fontsDir, 'inter-latin-400-normal.woff2'));
const interBoldWoff2 = readFileSync(path.join(fontsDir, 'inter-latin-700-normal.woff2'));
const mermaidFontsCss = `data:text/css;base64,${Buffer.from(
  `
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 400;
    src: url(data:font/woff2;base64,${interRegularWoff2.toString('base64')}) format('woff2');
  }
  @font-face {
    font-family: 'Inter';
    font-style: normal;
    font-weight: 700;
    src: url(data:font/woff2;base64,${interBoldWoff2.toString('base64')}) format('woff2');
  }
  `
).toString('base64')}`;

/** @type {import('mermaid').MermaidConfig} */
const lightConfig = {
  theme: 'neutral',
  fontFamily,
  themeVariables: {
    // Verde de destaque do site (--color-accent em global.css).
    noteBkgColor: 'hsl(156, 45%, 94%)',
    noteBorderColor: 'hsl(156, 45%, 32%)',
    noteTextColor: '#1f2320',
  },
};

/** @type {import('mermaid').MermaidConfig} */
const darkConfig = {
  theme: 'dark',
  fontFamily,
  themeVariables: {
    noteBkgColor: 'hsl(156, 30%, 18%)',
    noteBorderColor: 'hsl(156, 45%, 62%)',
    noteTextColor: '#ecece7',
  },
};

// Diretório do cache, relativo à raiz do projeto (um nível acima de plugins/).
// Incluído em .gitignore e no cache do CI (.github/workflows/deploy.yml).
const CACHE_DIR = fileURLToPath(new URL('../.cache/mermaid-svg/', import.meta.url));

/**
 * Overrides de `preset-default` do svgo usadas por `optimizeSvg()` logo
 * abaixo. Também entra no hash de `CONFIG_VERSION`, então mudar isto
 * invalida o cache sozinho — mesmo raciocínio de `lightConfig`/`darkConfig`.
 *
 * Anotado explicitamente como `PresetDefaultOverrides`: sem isso o
 * TypeScript infere os literais `false` como `boolean` (alargado, por não
 * haver tipo esperado no contexto de um `const` solto), o que deixa de
 * bater com o tipo exato que `optimize()` espera em `overrides` — e o
 * checker cai para o branch `CustomPlugin` da união `PluginConfig` (que
 * exige `fn`), gerando falso positivo em `astro check`.
 * @type {import('svgo').PresetDefaultOverrides}
 */
const svgoOverrides = {
  cleanupIds: false,
  inlineStyles: false,
  mergeStyles: false,
  minifyStyles: false,
  // `convertShapeToPath` reescreve <rect>/<circle>/<polygon>/<line>/<ellipse>
  // em <path> pra economizar bytes — mas o <style> que o próprio Mermaid
  // gera estiliza essas formas por seletor de TAG combinado com classe
  // (ex.: `.cluster rect{fill:...}`, `.node circle{...}`). Depois da
  // conversão a tag vira <path> e esse seletor não bate mais em nada, então
  // o elemento cai no fill padrão do SVG (preto) — o fundo preto nos
  // clusters (e potencialmente em outras formas) relatado pelo usuário.
  // Desligado pelo mesmo motivo dos overrides acima: correção > bytes.
  convertShapeToPath: false,
};

// Muda sozinho se lightConfig/darkConfig/svgoOverrides mudarem, invalidando
// o cache automaticamente — não é preciso lembrar de limpar nada na mão.
const CONFIG_VERSION = createHash('sha256')
  .update(JSON.stringify({ lightConfig, darkConfig, mermaidFontsCss, svgoOverrides }))
  .digest('hex')
  .slice(0, 16);

/**
 * @param {string} text
 * @returns {string}
 */
function cacheKeyFor(text) {
  return createHash('sha256').update(`${CONFIG_VERSION}:${text}`).digest('hex');
}

/**
 * @param {string} key
 * @returns {Promise<{ light: { svg: string, width: number }, dark: { svg: string, width: number } } | null>}
 */
async function readCacheEntry(key) {
  try {
    const raw = await readFile(path.join(CACHE_DIR, `${key}.json`), 'utf8');
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

/**
 * @param {string} key
 * @param {{ light: { svg: string, width: number }, dark: { svg: string, width: number } }} data
 */
async function writeCacheEntry(key, data) {
  await mkdir(CACHE_DIR, { recursive: true });
  await writeFile(path.join(CACHE_DIR, `${key}.json`), JSON.stringify(data));
}

/**
 * Encolhe o SVG gerado pelo Mermaid (comentários, atributos vazios,
 * arredondamento numérico, ordenação de atributos etc.) SEM tocar em nada
 * que o isolamento claro/escuro dependa:
 *
 * - `cleanupIds` desligado: renomeia ids para curtos tipo "a"/"b" — cada SVG
 *   é otimizado isoladamente, então dois diagramas poderiam receber os
 *   MESMOS ids curtos e colidir quando embutidos juntos na mesma página
 *   (era exatamente para evitar isso que o plugin usa os prefixos
 *   mermaid-light-/mermaid-dark- em primeiro lugar).
 * - `inlineStyles`/`mergeStyles`/`minifyStyles` desligados: em teste manual,
 *   com `multipass` ligado (ou certas combinações dessas três), o `<style>`
 *   embutido do Mermaid podia ser removido inteiramente em vez de só
 *   inlinado — quebrando os seletores `#mermaid-light-N .classe` de que o
 *   restante do pipeline depende. Mais seguro deixar o `<style>` como o
 *   Mermaid gerou.
 * - `multipass: false`: o problema acima só aparecia com múltiplos passes;
 *   um passe único evita essas interações entre plugins que não foram
 *   testadas contra os ~20 diagramas reais deste repo (sem Chromium light/
 *   dark lado a lado, não dá pra confirmar com segurança que combinações
 *   mais agressivas não vazam estilo entre os dois temas).
 * - `removeViewBox`/`removeDimensions` nem fazem parte do preset-default
 *   nesta versão do svgo — não precisam ser desligados.
 * - `convertShapeToPath` desligado: ver o comentário em `svgoOverrides`
 *   acima — sem isso, formas básicas (retângulo de cluster, círculo de nó
 *   inicial/final etc.) viram `<path>` e os seletores de tag do `<style>`
 *   do próprio Mermaid (`.cluster rect`, `.node circle`, ...) param de
 *   bater, deixando o elemento com o fill padrão do SVG (preto).
 * @param {string} svg
 * @returns {string}
 */
function optimizeSvg(svg) {
  const result = optimize(svg, {
    multipass: false,
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: svgoOverrides,
        },
      },
    ],
  });
  return result.data;
}

// Um único renderer para o build inteiro; a instância do browser é
// reaproveitada entre arquivos e fechada quando não há mais diagramas.
// `--no-sandbox`: o conteúdo renderizado é o Markdown do próprio repositório
// (confiável), e o sandbox do Chromium é a fonte mais comum de falhas/travas
// em CI e containers (user namespaces restritos, AppArmor etc.).
const renderer = createMermaidRenderer({
  launchOptions: { args: ['--no-sandbox'] },
});

/**
 * @param {import('hast').Element} code
 * @returns {string}
 */
function codeText(code) {
  let text = '';
  visit(code, 'text', (node) => {
    text += node.value;
  });
  return text;
}

/**
 * @param {string} svg
 * @param {'light' | 'dark'} theme
 * @returns {import('hast').Element}
 */
function svgWrapper(svg, theme) {
  const fragment = fromHtml(svg, { fragment: true });
  return {
    type: 'element',
    tagName: 'div',
    properties: { className: ['mermaid-svg', `mermaid-svg-${theme}`] },
    children: /** @type {import('hast').Element['children']} */ (fragment.children),
  };
}

/** @returns {import('unified').Transformer<import('hast').Root>} */
export default function rehypeMermaid() {
  return async (tree, file) => {
    /** @type {{ parent: import('hast').Parent, index: number, text: string }[]} */
    const targets = [];

    visit(tree, 'element', (node, index, parent) => {
      if (node.tagName !== 'pre' || !parent || typeof index !== 'number') return;
      const code = node.children.find(
        (child) => child.type === 'element' && child.tagName === 'code'
      );
      if (!code || code.type !== 'element') return;
      const className = code.properties?.className;
      if (!Array.isArray(className) || !className.includes('language-mermaid')) return;
      targets.push({ parent, index, text: codeText(code) });
    });

    if (targets.length === 0) return;

    const keys = targets.map((target) => cacheKeyFor(target.text));
    const cached = await Promise.all(keys.map(readCacheEntry));

    const pending = targets
      .map((target, i) => ({ target, key: keys[i], i }))
      .filter(({ i }) => !cached[i]);

    /** @type {PromiseSettledResult<import('mermaid-isomorphic').RenderResult>[]} */
    let lightResults = [];
    /** @type {PromiseSettledResult<import('mermaid-isomorphic').RenderResult>[]} */
    let darkResults = [];
    if (pending.length > 0) {
      const diagrams = pending.map(({ target }) => target.text);
      [lightResults, darkResults] = await Promise.all([
        renderer(diagrams, { mermaidConfig: lightConfig, prefix: 'mermaid-light', css: mermaidFontsCss }),
        renderer(diagrams, { mermaidConfig: darkConfig, prefix: 'mermaid-dark', css: mermaidFontsCss }),
      ]);
    }

    /** @type {{ light: { svg: string, width: number }, dark: { svg: string, width: number } }[]} */
    const resolved = new Array(targets.length);

    for (let i = 0; i < targets.length; i++) {
      const entry = cached[i];
      if (entry) {
        resolved[i] = entry;
      }
    }

    await Promise.all(
      pending.map(async ({ key, i }, pendingIndex) => {
        const light = lightResults[pendingIndex];
        const dark = darkResults[pendingIndex];
        if (light.status === 'rejected' || dark.status === 'rejected') {
          // Narrows por ramo: no ternário, `dark.status === 'rejected'` só
          // é avaliado quando `light` NÃO é o rejeitado, e o TS entende que
          // `dark.reason` só existe dentro desse ramo.
          const reason =
            light.status === 'rejected' ? light.reason : dark.status === 'rejected' ? dark.reason : undefined;
          throw new Error(
            `Falha ao renderizar diagrama Mermaid em ${file.path ?? 'arquivo desconhecido'}: ${reason}`
          );
        }

        const data = {
          light: { svg: optimizeSvg(light.value.svg), width: light.value.width },
          dark: { svg: optimizeSvg(dark.value.svg), width: dark.value.width },
        };
        resolved[i] = data;
        await writeCacheEntry(key, data);
      })
    );

    targets.forEach((target, i) => {
      const { light, dark } = resolved[i];

      /** @type {import('hast').Element} */
      const wrapper = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['mermaid-diagram'],
          // Largura natural do diagrama: em telas estreitas o CSS usa este
          // valor como min-width para manter o texto legível (com scroll
          // horizontal) em vez de encolher o SVG inteiro.
          style: `--mermaid-natural-width: ${Math.ceil(light.width)}px`,
        },
        children: [svgWrapper(light.svg, 'light'), svgWrapper(dark.svg, 'dark')],
      };
      target.parent.children[target.index] = wrapper;
    });
  };
}
