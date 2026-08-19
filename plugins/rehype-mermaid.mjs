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
 * Saída gerada:
 *   <div class="mermaid-diagram">
 *     <div class="mermaid-svg mermaid-svg-light"><svg …/></div>
 *     <div class="mermaid-svg mermaid-svg-dark"><svg …/></div>
 *   </div>
 */
import { fromHtml } from 'hast-util-from-html';
import { createMermaidRenderer } from 'mermaid-isomorphic';
import { visit } from 'unist-util-visit';

/** Mesma pilha de --font-ui em global.css, para o diagrama casar com o site. */
const fontFamily = "'Inter', system-ui, -apple-system, 'Segoe UI', sans-serif";

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

    const diagrams = targets.map((target) => target.text);
    // Prefixos distintos: cada SVG do Mermaid embute um <style> com seletores
    // baseados no próprio id; ids iguais fariam o CSS de um tema vazar no outro.
    const [lightResults, darkResults] = await Promise.all([
      renderer(diagrams, { mermaidConfig: lightConfig, prefix: 'mermaid-light' }),
      renderer(diagrams, { mermaidConfig: darkConfig, prefix: 'mermaid-dark' }),
    ]);

    targets.forEach((target, i) => {
      const light = lightResults[i];
      const dark = darkResults[i];
      if (light.status === 'rejected' || dark.status === 'rejected') {
        const reason = light.status === 'rejected' ? light.reason : /** @type {PromiseRejectedResult} */ (dark).reason;
        throw new Error(
          `Falha ao renderizar diagrama Mermaid em ${file.path ?? 'arquivo desconhecido'}: ${reason}`
        );
      }

      /** @type {import('hast').Element} */
      const wrapper = {
        type: 'element',
        tagName: 'div',
        properties: {
          className: ['mermaid-diagram'],
          // Largura natural do diagrama: em telas estreitas o CSS usa este
          // valor como min-width para manter o texto legível (com scroll
          // horizontal) em vez de encolher o SVG inteiro.
          style: `--mermaid-natural-width: ${Math.ceil(light.value.width)}px`,
        },
        children: [svgWrapper(light.value.svg, 'light'), svgWrapper(dark.value.svg, 'dark')],
      };
      target.parent.children[target.index] = wrapper;
    });
  };
}
