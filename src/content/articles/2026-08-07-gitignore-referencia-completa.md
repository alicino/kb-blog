---
title: ".gitignore: o guia completo da sintaxe"
description: "A referência completa de .gitignore: sintaxe de padrões com exemplos testados, negação que realmente funciona, precedência entre arquivos e como depurar qualquer padrão."
publishDate: 2026-08-07
author: "Alicino"
category: "Ferramentas"
tags: ["git", "gitignore", "controle-de-versao", "boas-praticas"]
draft: false
---

<img src="/assets/img/2026-08-07-gitignore-referencia-completa-1.png" alt="Capa do guia completo de .gitignore: sintaxe de padrões, negação, precedência e depuração" width="1200" height="333" />

O Git registra mudanças, mas nunca decide o que merece ser registrado. Essa decisão é sua, e ela fica escrita num arquivo que a maioria das pessoas copia de algum lugar e nunca lê de verdade: o `.gitignore`.

O custo de não ler é silencioso. Você roda `git add .` e o seu `node_modules/` vai junto. O seu `dist/` vai junto. Um `.env` com a senha do banco vai junto, e fica no histórico para sempre, porque o Git não esquece um commit.

Este guia é uma referência. Cada padrão abaixo foi testado contra o Git, e onde uma receita comum está errada, a versão errada aparece ao lado da correta, para você reconhecê-la quando cruzar com ela.

## O que você vai aprender

Ao final deste guia você vai conseguir ler qualquer arquivo `.gitignore` e prever exatamente o que ele faz. Especificamente:

- Os quatro lugares de onde o Git lê regras de exclusão, e qual usar em cada situação
- A sintaxe dos padrões, uma regra por vez, com o caso que quebra cada uma
- Por que a negação falha mais do que as pessoas esperam, e as duas formas de corrigir
- Bases prontas para Python, Node.js, Go, Ruby, Java e Docker

## Como o .gitignore funciona

Um arquivo `.gitignore` é texto puro, um padrão por linha. O Git o lê quando decide se um arquivo é "não rastreado" (untracked) ou "ignorado".

Três detalhes dessa frase importam mais do que parecem.

Primeiro, o `.gitignore` só afeta arquivos **não rastreados**. Se um arquivo já está sendo rastreado, adicioná-lo ao `.gitignore` não muda nada: o Git continua rastreando. Esta é a fonte de confusão mais comum de todas, então ela ganha uma seção própria mais adiante.

Segundo, um padrão casa com **caminhos**, não com o conteúdo dos arquivos. O Git nunca abre seus arquivos para decidir se deve ignorá-los.

Terceiro, os padrões são **relativos ao arquivo que os contém**. Um `.gitignore` dentro de `src/` interpreta `build/` de forma diferente de um na raiz do repositório.

## Os quatro lugares de onde o Git lê padrões

O Git não tem um arquivo de exclusão. Tem quatro fontes, com uma ordem de precedência, e a maior parte dos problemas atribuídos a "o gitignore não funciona" na verdade é uma regra morando numa fonte que a pessoa não sabe que existe.

Da precedência mais alta para a mais baixa:

1. **Padrões passados na linha de comando**, nos comandos que os aceitam.
2. **Arquivos `.gitignore` na árvore**: o arquivo no mesmo diretório do caminho, ou em qualquer diretório pai até a raiz do repositório. Uma regra num arquivo mais profundo sobrepõe a mesma regra num arquivo mais raso. São esses os arquivos que você versiona e compartilha com o time.
3. **`.git/info/exclude`**: padrões específicos do seu clone, não compartilhados com ninguém. Ideal para arquivos pessoais de rascunho que vivem dentro do repositório.
4. **O arquivo indicado por `core.excludesFile`**: o seu arquivo de exclusão da máquina, apontando por padrão para `$XDG_CONFIG_HOME/git/ignore`, que é `~/.config/git/ignore` quando essa variável não está definida. É aqui que entram o lixo do sistema operacional e do editor, para você nunca mais escrever `.DS_Store` em projeto algum.

A regra prática: se todo desenvolvedor deve ignorar, vai no `.gitignore`. Se é só sobre a sua máquina, vai em `~/.config/git/ignore`. Se é sobre este repositório mas só para você, use o `.git/info/exclude`.

## A sintaxe dos padrões, regra por regra

### A barra decide até onde o padrão alcança

Esta regra causa o maior dano silencioso, então ela vem primeiro.

- Se o padrão contém uma barra **no começo ou no meio**, ele fica ancorado no diretório do próprio arquivo `.gitignore`.
- Se ele **não** contém barra alguma, pode casar em **qualquer nível** abaixo.

```
/build/        # só o build/ da raiz
src/build/     # só src/build/
build/         # build/ em qualquer nível
```

Testado: com `build/`, tanto `build/a.txt` quanto `src/build/b.txt` são ignorados. Com `/build/`, só `build/a.txt` é.

### A barra no final significa "somente diretórios"

Um padrão que termina em `/` casa com diretórios e, portanto, com tudo dentro deles. Sem a barra no final, o padrão pode casar com um arquivo ou um diretório com aquele nome.

```
foo/     # um diretório chamado foo, e tudo dentro dele
foo      # qualquer arquivo ou diretório chamado foo
```

### O asterisco nunca atravessa uma barra

O `*` casa com qualquer coisa **menos** uma barra. Esse único detalhe invalida uma receita que você encontra em muitos blogs:

```
# ✗ ERRADO: e este é um erro muito comum
*/node_modules/

# ✓ CORRETO
node_modules/
```

Testado numa árvore com `node_modules/`, `app/node_modules/` e `app/lib/node_modules/`:

- `node_modules/` ignora **os três**.
- `*/node_modules/` ignora **apenas** `app/node_modules/`, porque o `*` casa com exatamente um segmento de caminho. Ele perde tanto o da raiz quanto o que está dois níveis abaixo.

O comentário que normalmente acompanha a versão errada diz "ignorar todos os node modules". Não é o que ela faz.

### A negação, e por que ela costuma falhar

Um padrão que começa com `!` reinclui um arquivo que um padrão anterior excluiu. A ordem importa, e o diretório pai também.

Aqui está a falha que surpreende todo mundo. O padrão da esquerda parece certo e não faz nada:

```
# ✗ ERRADO: important.log continua ignorado
logs/
!logs/important.log

# ✓ CORRETO
logs/*
!logs/important.log
```

O motivo está no manual oficial: **não é possível reincluir um arquivo se um diretório pai dele está excluído**. O Git não desce em diretórios excluídos, então ele nunca enxerga o `logs/important.log` para reconsiderá-lo. Essa regra existe puramente por desempenho.

Testado: com `logs/` mais `!logs/important.log`, os dois arquivos continuam ignorados. Troque a primeira linha por `logs/*` e o `important.log` fica livre, enquanto o `error.log` continua ignorado.

A segunda coisa a saber sobre negação é que ela precisa de um caminho, não de uma esperança. Esta receita é do manual e exclui tudo exceto um diretório:

```
/*
!/foo
/foo/*
!/foo/bar
```

Repare no `/*` em vez de `*`. Sem a barra inicial, o curinga também engoliria tudo dentro de `foo/bar`.

### Globstar: três formas documentadas

Dois asteriscos seguidos têm comportamento especial em apenas três posições. Em qualquer outro lugar, são só dois asteriscos comuns.

```
**/foo          # um arquivo ou diretório chamado foo em qualquer lugar
abc/**          # tudo dentro de abc, em profundidade infinita
a/**/b          # a/b, a/x/b, a/x/y/b: zero ou mais diretórios
```

Testado: `abc/**` ignora `abc/a.txt` e `abc/x/y/b.txt`, mas deixa `other/abc/c.txt` em paz, porque o padrão está ancorado no diretório que contém o `.gitignore`.

### Faixas de caracteres e o ponto de interrogação

```
temp[1-5].txt    # temp1.txt até temp5.txt
file?.log        # file seguido de exatamente um caractere
*.LOG            # extensões em maiúscula são um padrão separado
```

Os padrões são **sensíveis a maiúsculas** no Linux e no macOS por padrão. `*.log` não cobre `LOG` nem `File.LOG`.

### Escapando um ! ou # literal

```
\!important.txt    # um arquivo que realmente começa com !
\#notas.txt        # um arquivo que realmente começa com #
```

Ambos confirmados casando com os nomes literais.

### Comentários, linhas em branco e uma armadilha de espaço

Uma linha começando com `#` é comentário. Uma linha em branco não casa com nada e serve para separar blocos. Espaços no final da linha são **ignorados**, a menos que escapados com barra invertida: uma armadilha real quando você cola padrões de uma página web.

## Precedência quando vários arquivos discordam

Quando duas regras casam com o mesmo caminho, vence a localização mais específica, e dentro de um mesmo arquivo vence o **último padrão que casa**. É isso que faz o par `logs/*` mais `!logs/important.log` funcionar: a segunda linha vem depois da primeira, no mesmo arquivo.

Um exemplo do manual, usando um arquivo aninhado. O `.gitignore` da raiz contém `vmlinux*`. Então um arquivo aninhado reinclui um caminho:

```bash
echo '!/vmlinux*' > arch/foo/kernel/.gitignore
```

Como o arquivo aninhado é mais profundo, a regra dele sobrepõe a da raiz só naquele diretório.

## Bases prontas para usar

Estes são pontos de partida, não arquivos acabados. Apague o que não se aplica em vez de acumular linhas que você não sabe explicar.

### Python

```gitignore
# Arquivos compilados
__pycache__/
*.py[cod]
*$py.class
*.so

# Ambientes virtuais
venv/
env/
.venv/

# Distribuição e build
build/
dist/
*.egg-info/

# Testes e cobertura
.pytest_cache/
.coverage
htmlcov/
.tox/

# Segredos: nunca commitados
.env
.env.local
*.pem
```

### Node.js

```gitignore
# Dependências
node_modules/

# Saída de build
dist/
build/
.next/
.nuxt/

# Ambiente
.env
.env.local
.env.*.local

# Logs
*.log
logs/

# Testes
coverage/
.nyc_output/

# Caches
.eslintcache
.cache/

# Sistema e editor
.DS_Store
Thumbs.db
```

### Go

```gitignore
# Binários
*.exe
*.dll
*.so
*.dylib

# Saída de build
build/
dist/

# Artefatos de teste
*.test
*.out
coverage.txt

# Ambiente
.env
```

Repare na ausência proposital do `vendor/`. Em Go, usar vendor é uma escolha legítima para builds reprodutíveis. Ignorá-lo ou não depende da decisão do seu time, não de gosto.

### Ruby

```gitignore
# Bundler
vendor/bundle/
.bundle/

# Artefatos de build
pkg/
*.gem

# Testes
coverage/
.rspec_results/

# Ambiente
.env
.env.local
```

### Java

```gitignore
# Saída de build
target/
build/
out/

# Gradle
.gradle/

# Maven
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup

# IDE
.idea/
*.iml
.classpath
.project
.settings/
```

### Docker

```gitignore
# Overrides locais do compose
docker-compose.override.yml

# Ambiente
.env
.env.local

# Logs
docker-logs/
*.log
```

## Não ignore os seus lock files

Esta é uma decisão, não um detalhe, e errar aqui quebra a reprodutibilidade.

`package-lock.json`, `yarn.lock`, `poetry.lock`, `Pipfile.lock` e `Gemfile.lock` registram as versões exatas que cada desenvolvedor e cada deploy vão instalar. Ignorá-los significa que cada máquina resolve as próprias versões, e "na minha máquina funciona" vira uma condição permanente.

Commite os seus lock files. Deixe o `.gitignore` para saída gerada e segredos.

## O erro que já aconteceu: o arquivo rastreado antes de você ignorá-lo

Adicionar um arquivo ao `.gitignore` **não** faz o Git parar de rastreá-lo. Se ele foi commitado, continua commitado, e continua aparecendo no `git status`, e é por isso que as pessoas concluem que "o padrão está quebrado".

O padrão está certo. O arquivo é que está rastreado. Remova-o do índice mantendo-o no disco:

```bash
git rm --cached .env
git commit -m "Parar de rastrear o .env"
```

Use `--cached`. O `git rm .env` puro também apaga o arquivo do seu diretório de trabalho, o que no caso de um `.env` significa apagar as suas próprias credenciais. Se estiver removendo um diretório, adicione `-r`:

```bash
git rm -r --cached node_modules/
```

E esteja ciente do que isso **não** resolve: o arquivo continua em todos os commits anteriores, e qualquer pessoa que clonar consegue recuperá-lo. Se o que vazou foi um segredo real, rotacione a credencial primeiro. Reescrever o histórico é um trabalho separado, e muito maior.

## Depurando qualquer padrão com o git check-ignore

O `git check-ignore` é a ferramenta para isso, e vale aprendê-la direito, porque a versão que circula por aí não existe.

```bash
# Qual regra é responsável por ignorar este arquivo?
git check-ignore -v .env
# .gitignore:12:.env

# Vários caminhos de uma vez
git check-ignore -v node_modules/ dist/ .env

# Uma lista inteira, pela entrada padrão: o jeito seguro de checar em massa
git ls-files --others | git check-ignore -v --stdin

# Mostre também os arquivos que NÃO estão ignorados, para distinguir os casos
git check-ignore -v --no-index -n .env
```

O formato da saída é `origem:linha:padrão`. É isso que torna o comando útil: ele não só diz que o arquivo está ignorado, diz **qual linha de qual arquivo** fez isso, o que resolve o problema de precedência entre as quatro fontes em segundos.

Duas observações de uso real:

- A variante `git check-ignore -r *`, que aparece em guias antigos, falha com `error: unknown switch 'r'`. Não existe `-r`. Para alimentar uma árvore inteira, use `--stdin` como acima.
- Sem os parâmetros `-v` e `-n` você não consegue distinguir "nenhum padrão casou" de "casou um padrão negado", porque os dois não imprimem nada.

O código de saída tem significado em scripts: `0` quando ao menos um caminho está ignorado, `1` quando nenhum está, `128` em erro fatal.

Para inspecionar o repositório inteiro em vez de um caminho só:

```bash
git status --ignored              # arquivos ignorados, agrupados
git status --ignored -uall        # todos os arquivos, um por linha
git ls-files --others --ignored --exclude-standard
```

## Usando os templates oficiais

O melhor ponto de partida é o repositório que o próprio GitHub mantém:

```
https://github.com/github/gitignore
```

Ele é organizado por linguagem e framework, e aceita contribuições. Existe também o `gitignore.io`, que gera um arquivo combinando vários templates. Vale saber, antes de depender dele: o repositório de templates do qual ele depende foi **arquivado em 24 de janeiro de 2025** e está somente leitura, então não recebe mais templates novos. Ele ainda funciona para stacks estabelecidas, mas para qualquer coisa recente, confira o `github/gitignore` primeiro.

Escolha qual escolher, copie e corte. Um arquivo gerado com 200 linhas que você não leu é pior do que 20 linhas que você entende, porque no dia em que algo que deveria ser rastreado for ignorado, você vai ter que investigar regras que não reconhece.

## Hábitos de time que mantêm o .gitignore saudável

Quatro práticas previnem quase todo problema deste guia:

**Trate o `.gitignore` como código.** Ele mora no repositório, passa por revisão, e mudanças nele vêm com um motivo. Uma linha `*.json` sem explicação pode esconder um arquivo de configuração que o time inteiro espera que seja rastreado.

**Use o `.git/info/exclude` para arquivos pessoais.** Seus scripts de rascunho e backups de editor não devem gerar ruído de revisão para ninguém.

**Use um arquivo de exclusão global para o lixo de sistema e editor.** Configure uma vez:

```bash
git config --global core.excludesFile ~/.config/git/ignore
```

Assim `.DS_Store`, `Thumbs.db` e `*.swp` param de aparecer no diff de todo projeto.

**Adicione padrões conforme você os encontra, e diga por quê.** Um comentário acima de um padrão incomum vale mais do que um item num guia de estilo, porque ele conta para a próxima pessoa se a regra ainda é necessária.

## Conclusão

O `.gitignore` recompensa ser lido ao pé da letra. A barra decide o alcance, o `*` nunca atravessa uma barra, a barra no final significa diretório, e a negação não consegue resgatar um arquivo dentro de um diretório excluído. Essas quatro regras explicam quase todo bug que você vai encontrar.

O fluxo que se sustenta: comece de um template mantido, mantenha o arquivo versionado e revisado, coloque as regras pessoais e de máquina na fonte certa entre as quatro, commite os seus lock files, e recorra ao `git check-ignore -v` em vez de adivinhar.

E quando um segredo já foi commitado, lembre da ordem das operações: remova do índice e depois rotacione a credencial. A reescrita do histórico é o último passo, não o primeiro.

## Fontes e links

- [gitignore — página oficial do manual](https://git-scm.com/docs/gitignore) — a referência normativa de cada regra de padrão deste guia
- [git-check-ignore — documentação oficial](https://git-scm.com/docs/git-check-ignore) — parâmetros, formato de saída e código de retorno
- [github/gitignore](https://github.com/github/gitignore) — a coleção mantida de templates, com regras de contribuição
- [GitHub Docs: Ignorando arquivos](https://docs.github.com/en/get-started/git-basics/ignoring-files) — o ponto de entrada por linguagem para o uso do dia a dia
- [gitignore.io · issue #650](https://github.com/toptal/gitignore.io/issues/650) — o registro do arquivamento do repositório de templates em 24 de janeiro de 2025
