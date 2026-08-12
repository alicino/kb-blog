---
title: "A importância de um bom .gitignore para seu repositório e como reverter deslizes"
description: "Um guia completo sobre .gitignore: por que ele é essencial, exemplos por linguagem, como evitar arquivos de IA, e um passo a passo para remover dados sensíveis do histórico do Git."
publishDate: 2026-08-07
author: "Alicino"
category: "Engenharia"
tags: ["git", "seguranca", "boas-praticas", "tutorial", "devops"]
draft: false
---

# A importância de um bom .gitignore para seu repositório e como reverter deslizes

Você já parou para pensar no que acontece quando roda `git add .` e depois `git commit`? O Git pega tudo que está na pasta do projeto. Tudo mesmo. Arquivos de configuração com senhas, pastas de dependências, arquivos temporários do seu sistema operacional, e até anotações pessoais. Sem um bom `.gitignore`, o seu repositório vira um depósito de arquivos que não deveriam estar ali. E o pior: uma vez que algo sensível entra no histórico do Git, simplesmente deletar o arquivo não resolve. Ele continua lá, acessível para qualquer um que olhar os commits antigos.

Neste artigo, você vai entender por que o `.gitignore` é uma das primeiras linhas de defesa da segurança do seu projeto. Vamos ver exemplos práticos para diferentes linguagens, aprender a evitar arquivos de ferramentas de IA, e descobrir como limpar o histórico quando um deslize acontece.

## O que você vai aprender

1. Por que o `.gitignore` é essencial para qualquer projeto
2. Exemplos de arquivos e pastas que devem ser ignorados por linguagem
3. Como evitar que arquivos de IA e ferramentas pessoais entrem no repositório
4. Uma situação real: o que fazer quando você commite um arquivo `.env` por acidente
5. Como limpar o histórico do Git com `git filter-repo`

## O que é o .gitignore e por que ele importa

O `.gitignore` é um arquivo de texto simples que fica na raiz do seu repositório. Ele diz ao Git quais arquivos e pastas devem ser completamente ignorados. O Git não rastreia esses arquivos, não os inclui em commits, e não os envia para o repositório remoto.

Sem um `.gitignore`, você corre riscos sérios:

1. **Vazamento de credenciais**: Arquivos como `.env`, `config.json` com senhas, ou certificados podem ser expostos publicamente
2. **Poluição do repositório**: Pastas como `node_modules/` ou `__pycache__/` contêm milhares de arquivos que não são do seu projeto
3. **Conflitos desnecessários**: Arquivos gerados automaticamente podem causar conflitos entre desenvolvedores
4. **Exposição de dados pessoais**: Ferramentas de IA e editores criam arquivos que revelam como você trabalha

## O básico da sintaxe do .gitignore

Antes de ver exemplos, é importante entender como o `.gitignore` funciona. A sintaxe é simples mas poderosa. Você pode usar padrões glob, exceções, e regras que se aplicam a qualquer nível do projeto.

Veja este exemplo básico:

```gitignore
# Isso é um comentário. Tudo depois da hashtag é ignorado pelo Git.

# Ignora um arquivo específico
secrets.txt

# Ignora uma pasta inteira
node_modules/

# Ignora todos os arquivos .log em qualquer pasta
*.log

# Mas NÃO ignora important.log (a exclamação nega a regra)
!important.log

# Ignora todos os arquivos em qualquer pasta build/ do projeto
**/build/
```

A linha `secrets.txt` diz ao Git para ignorar apenas esse arquivo específico na raiz. Já `node_modules/` ignora toda a pasta e tudo que está dentro dela. O `*.log` usa um asterisco como coringa, então qualquer arquivo terminado em `.log` é ignorado, não importa o nome. A exclamação em `!important.log` cria uma exceção, útil quando você quer ignorar todos os logs menos um específico. E o `**/build/` é bem poderoso: os dois asteriscos dizem ao Git para procurar uma pasta chamada `build` em qualquer lugar do projeto, não só na raiz.

## Exemplos por linguagem

Agora vamos conversar sobre o que cada linguagem costuma gerar que não deve ir para o repositório. Vou explicar linha por linha para que você entenda o porquê de cada regra.

### Node.js / JavaScript

Quando você trabalha com Node.js, a primeira coisa que nota é a pasta `node_modules/`. Ela aparece assim que você roda `npm install` e pode ter milhares de arquivos. São as dependências do seu projeto, e elas não são suas. Cada desenvolvedor pode instalá-las localmente com um simples comando. Levar isso para o Git é como tentar guardar a biblioteca inteira quando você só precisa do catálogo.

```gitignore
# Dependências: esta pasta contém tudo que o npm/yarn baixa.
# Você recria ela com npm install, então não precisa versionar.
node_modules/

# Logs de debug do npm e yarn. Eles mostram erros temporários
# e são gerados automaticamente quando algo dá errado.
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Arquivos de lock. Eles travam versões exatas das dependências.
# Em projetos privados, algumas equipes versionam. Em bibliotecas
# open source, geralmente ignoram para dar flexibilidade.
package-lock.json
yarn.lock

# Variáveis de ambiente. AQUI MORAM SUAS SENHAS.
# Nunca, em hipótese alguma, versione este arquivo.
.env
.env.local
.env.*.local

# Pastas de build e cache. São geradas quando você compila
# o projeto. O código fonte já está versionado, o build não precisa.
dist/
build/
.cache/
.parcel-cache/

# Logs da aplicação. Eles crescem com o tempo e são específicos
# da sua máquina. Cada dev gera os seus.
logs/
*.log

# Relatórios de cobertura de testes. São gerados quando você
# roda a suíte de testes e mostram quais linhas foram executadas.
coverage/
.nyc_output/

# Configurações de IDEs. São pessoais e não afetam o projeto.
# Cada desenvolvedor usa o editor que preferir.
.vscode/
.idea/
*.swp
*.swo
```

Note que `package-lock.json` e `yarn.lock` são um caso especial. Em um projeto privado da empresa, versionar o `package-lock.json` garante que todos usem exatamente as mesmas versões das dependências. Isso evita aquele clássico "na minha máquina funciona". Mas se você está criando uma biblioteca open source, como um pacote no npm, versionar o lock file pode dar dor de cabeça para quem usa sua biblioteca. A regra é: decida conscientemente e converse com sua equipe.

### Python

Python é uma linguagem maravilhosa, mas ela deixa rastros. Quando você executa um arquivo `.py`, o interpretador cria bytecode compilado para acelerar a próxima execução. Esse bytecode fica na pasta `__pycache__/`. O problema é que esse bytecode é específico da versão do Python e do sistema operacional. Se você versionar isso, seu colega que usa Linux vai receber bytecode gerado no seu macOS, e isso simplesmente não faz sentido.

```gitignore
# Bytecode compilado do Python. É gerado automaticamente
# quando você roda um script. Específico da sua máquina.
__pycache__/
*.py[cod]
*$py.class
*.so

# Ambientes virtuais. São instalações isoladas do Python
# para este projeto específico. Cada dev cria o seu.
venv/
env/
ENV/
.venv/

# Pastas de build e distribuição. Contêm o pacote gerado
# para publicação no PyPI. Você recria quando precisar.
build/
dist/
*.egg-info/
.eggs/

# Cache de testes e cobertura. Gerados ao rodar pytest
# ou ferramentas de cobertura. São temporários.
.pytest_cache/
.coverage
htmlcov/

# Variáveis de ambiente. Mesma regra: senhas não vão para o Git.
.env
.env.local

# Configurações de IDEs. Pessoais de cada desenvolvedor.
.vscode/
.idea/
*.swp

# Checkpoints do Jupyter Notebook. O Jupyter salva snapshots
# automáticos dos seus notebooks. Eles poluem o repositório.
.ipynb_checkpoints/
```

Atenção especial ao `__pycache__/`. Muita gente nova em Python não entende por que ignorar essa pasta. A resposta é simples: ela é um cache. Seu código fonte é o que importa. O `__pycache__/` é apenas uma otimização que o Python recria sozinho. Versionar cache é como versionar a pasta temporária do seu navegador.

### Go

Go tem uma filosofia diferente. A linguagem foi projetada para ser simples e direta. Quando você compila um programa Go, gera um binário executável. Esse binário é específico da arquitetura onde foi compilado. Um binário compilado no macOS não roda no Linux, então não faz sentido versionar.

```gitignore
# Binários compilados. São gerados com go build.
# Específicos do sistema operacional e arquitetura.
*.exe
*.exe~
*.dll
*.so
*.dylib

# Arquivos de teste compilados. O Go gera binários
# temporários quando você roda go test.
*.test
*.out

# Dependências vendored (opcional). Go pode copiar
# dependências para uma pasta vendor/. Algumas equipes
# versionam para garantir builds reproduzíveis. Outras
# preferem usar go modules. Decida com sua equipe.
# vendor/

# Variáveis de ambiente. Sempre ignore.
.env
.env.local

# Configurações de IDEs. Pessoais.
.vscode/
.idea/
*.swp

# Workspaces do Go. Arquivos de configuração de workspace
# que são específicos da sua organização local.
go.work
go.work.sum
```

A linha `# vendor/` está comentada de propósito. Em Go, existe um debate saudável sobre versionar ou não a pasta `vendor/`. Quando você versiona, garante que o projeto sempre compile com as mesmas dependências, mesmo se o repositório original sumir. Mas isso aumenta o tamanho do seu repositório. A regra prática é: projetos aplicativos (que vão ser deployados) costumam versionar. Bibliotecas (que vão ser importadas) geralmente não versionam.

### Ruby

Ruby, com sua elegância, usa o Bundler para gerenciar dependências. Quando você roda `bundle install`, as gems são instaladas. Em desenvolvimento, você pode usar o modo `--path vendor/bundle` para isolar as gems do projeto. Essa pasta não deve ir para o Git, pois cada desenvolvedor e cada ambiente de deploy gerencia suas próprias dependências.

```gitignore
# Dependências do Bundler no modo vendor.
# Cada ambiente instala as suas gems.
/vendor/bundle
/.bundle

# Variáveis de ambiente. Sempre.
.env
.env.local

# Logs e arquivos temporários do Rails/Rack.
# São gerados durante a execução e crescem sem parar.
/log/*
/tmp/*

# Mas mantém os arquivos .keep, pois o Git não versiona
# pastas vazias. O .keep é um truque para manter a estrutura.
!/log/.keep
!/tmp/.keep

# Cache de testes e arquivos temporários do Capybara.
*.rbc
capybara-*.html
.rspec

# Banco de dados SQLite de desenvolvimento.
# É um arquivo binário que muda a cada request.
*.sqlite3
*.sqlite3-journal

# Configurações de IDEs. Pessoais.
.vscode/
.idea/
*.swp
```

As linhas `!/log/.keep` e `!/tmp/.keep` usam a exclamação para criar uma exceção. O Git não versiona pastas vazias, então a convenção em Ruby é colocar um arquivo vazio chamado `.keep` dentro de `log/` e `tmp/` para que a estrutura de pastas exista quando alguém clona o repositório. A regra `!/log/.keep` diz: "ignore tudo em `log/`, mas não ignore o arquivo `.keep`".

### Java

Java é uma linguagem compilada. Você escreve código `.java` e o compilador gera bytecode `.class`. Esses arquivos `.class` são instruções para a JVM e não precisam ser versionados, pois são gerados a partir do código fonte. Além disso, o ecossistema Java tem ferramentas de build poderosas como Maven e Gradle, que criam suas próprias pastas de trabalho.

```gitignore
# Bytecode compilado. Gerado pelo javac a partir dos .java.
*.class

# Pacotes e arquivos compactados. São gerados pelo processo
# de build para distribuição. Você recria quando precisar.
*.jar
*.war
*.ear
*.zip
*.tar.gz
*.rar

# Maven: pasta target e arquivos temporários de release.
# A pasta target/ contém o build completo do projeto.
target/
pom.xml.tag
pom.xml.releaseBackup
pom.xml.versionsBackup

# Gradle: pasta de build e cache.
# O Gradle mantém um cache local para acelerar builds.
build/
.gradle/

# Mas não ignore o wrapper do Gradle. Ele permite que
# qualquer pessoa compile o projeto sem ter o Gradle instalado.
!gradle/wrapper/gradle-wrapper.jar

# Configurações de IDEs Java. São muitos arquivos e todos pessoais.
.idea/
*.iml
*.ipr
*.iws
.classpath
.project
.settings/

# Variáveis de ambiente. Sempre.
.env
```

Note a linha `!gradle/wrapper/gradle-wrapper.jar`. O Gradle Wrapper é uma ferramenta inteligente. Em vez de exigir que cada desenvolvedor instale o Gradle na máquina, o wrapper baixa automaticamente a versão correta. O arquivo `gradle-wrapper.jar` é essencial para isso funcionar, por isso ele é a única exceção na pasta `gradle/`.

## Arquivos de IA e ferramentas pessoais

Agora vamos falar de algo que muita gente ainda não considera: os arquivos que ferramentas de IA e assistentes de código criam no seu projeto. Eles podem parecer inofensivos, mas merecem atenção.

```gitignore
# Arquivos de IA e assistentes de código.
# Eles podem conter instruções específicas do seu projeto,
# contexto de negócio, ou referências a sistemas internos.
# São úteis para você, mas não devem ser públicos.
CLAUDE.md
claude.md
.cursorrules
.cursor/
.github/copilot-instructions.md

# Configurações pessoais de IDEs.
# Estes arquivos guardam preferências do seu editor:
# temas, tamanho de fonte, atalhos personalizados.
# Não afetam o projeto e são específicos da sua máquina.
.vscode/settings.json
.vscode/launch.json
.idea/workspace.xml
.idea/tasks.xml

# Histórico de comandos e sessões de REPL.
# Podem conter comandos com senhas ou dados sensíveis
# que você digitou durante uma sessão interativa.
.bash_history
.zsh_history
.node_repl_history

# Arquivos do sistema operacional.
# O macOS cria .DS_Store em toda pasta para guardar
# configurações de visualização. O Windows cria Thumbs.db
# para cache de miniaturas. Nada a ver com seu projeto.
.DS_Store
Thumbs.db
desktop.ini

# Arquivos de backup criados por editores.
# O Vim cria arquivos *~ e .swp. Outros editores
# criam .bak. São temporários de recuperação.
*~
*.bak
*.tmp
*.temp
```

Vamos conversar sobre o `CLAUDE.md`. Se você usa o Claude Code ou outras ferramentas de IA que leem este arquivo, ele provavelmente contém instruções como: "Este projeto usa arquitetura hexagonal", "Nosso padrão de commit é conventional commits", ou até "O banco de dados de produção está na AWS região us-east-1". Essas informações são valiosas para o assistente de IA te ajudar, mas não precisam ser públicas. O mesmo vale para `.cursorrules`, que o Cursor IDE usa para entender como você quer que o código seja escrito.

## A situação de emergência: o commit do .env

Agora vamos à parte que ninguém quer viver, mas todo mundo deveria saber resolver. Imagine esta cena: é sexta-feira à noite, você está terminando uma feature importante. Configura as variáveis de ambiente no arquivo `.env`, testa localmente, tudo funciona. No automático, você roda:

```bash
git add .
git commit -m "feat: adiciona configuração de banco de dados"
git push origin main
```

Três comandos. Três segundos. E agora a string de conexão do seu banco de dados, com usuário e senha em texto puro, está no histórico do Git. Para sempre. Ou pelo menos até você agir corretamente.

### O problema

Você pode pensar: "Tudo bem, eu deleto o arquivo e faço outro commit". Mas o Git não funciona assim. O Git guarda o histórico completo de todas as alterações. Qualquer pessoa com acesso ao repositório pode rodar:

```bash
git log --all --full-history -- .env
```

E ver todos os commits onde o `.env` apareceu. Com um `git show <commit>:.env`, ela vê o conteúdo completo do arquivo naquele momento. Deletar o arquivo em um commit novo não apaga o arquivo dos commits antigos. É como apagar uma foto do seu feed, mas ela ainda existir nos backups do servidor.

### A solução: git filter-repo

O `git filter-repo` é a ferramenta moderna e recomendada para reescrever o histórico do Git. Ele é mais rápido, mais seguro, e mais fácil de usar que o antigo `git filter-branch`, que era lento e propenso a erros.

#### Passo 1: Instalar o git filter-repo

Primeiro, você precisa instalar a ferramenta. Ela está disponível na maioria dos gerenciadores de pacotes:

```bash
# macOS com Homebrew
brew install git-filter-repo

# Ubuntu/Debian
sudo apt-get install git-filter-repo

# Python (funciona em qualquer sistema com Python)
pip install git-filter-repo
```

Se nenhuma dessas opções funcionar, você pode baixar o script diretamente do repositório oficial. É um único arquivo Python, então não tem complicação.

#### Passo 2: Clonar o repositório fresco

Aqui é importante: trabalhe em uma cópia limpa. O `filter-repo` vai reescrever o histórico, e é melhor fazer isso em um clone espelhado para não correr riscos com o seu working directory:

```bash
# Clone espelhado traz todo o histórico, incluindo todas as branches
git clone --mirror https://github.com/seu-usuario/seu-repo.git
cd seu-repo.git
```

O `--mirror` cria um clone bare, que é uma cópia completa do repositório remoto sem working directory. É ideal para operações de manutenção no histórico.

#### Passo 3: Remover o arquivo do histórico

Agora vem o comando que resolve o problema:

```bash
git filter-repo --invert-paths --path .env --force
```

O que este comando faz, passo a passo:

1. `--invert-paths` inverte a lógica: em vez de manter apenas os caminhos especificados, ele remove os caminhos especificados
2. `--path .env` diz qual arquivo ou pasta remover
3. `--force` é necessário porque o `filter-repo` detecta que você está em um clone espelhado e quer ter certeza de que você sabe o que está fazendo

Este comando reescreve TODO o histórico do repositório. Ele passa por cada commit, em cada branch, e remove o arquivo `.env`. Os commits são recriados com novos hashes, porque o conteúdo mudou. Isso significa que o histórico antigo não existe mais neste clone.

#### Passo 4: Atualizar o repositório remoto

Depois de limpar o histórico local, você precisa enviar para o remoto. Mas atenção: como os commits foram reescritos, o Git vai rejeitar um push normal. Você precisa forçar:

```bash
# O filter-repo remove os remotes por segurança, então adicionamos de novo
git remote add origin https://github.com/seu-usuario/seu-repo.git

# Forçar o push reescreve o histórico no servidor
git push origin --force --all
```

O `--force` é necessário porque o histórico local divergiu do remoto. O `--all` garante que todas as branches sejam atualizadas, não só a main.

**Atenção importante**: Depois deste push forçado, todos os outros desenvolvedores precisarão clonar o repositório novamente. Se eles tentarem fazer pull, vão ter conflitos porque o histórico deles não bate com o remoto. A solução é:

```bash
# Para cada desenvolvedor na equipe
git fetch origin
git reset --hard origin/main  # ou a branch deles
```

Ou simplesmente clonar o repositório do zero, que é mais seguro.

#### Passo 5: Adicionar o .gitignore

Agora que o histórico está limpo, você precisa garantir que isso não aconteça de novo:

```bash
echo ".env" >> .gitignore
git add .gitignore
git commit -m "chore: adiciona .env ao .gitignore"
git push origin main
```

A partir de agora, o Git vai ignorar qualquer arquivo `.env` no projeto. Mas lembre-se: o `.gitignore` só funciona para arquivos que ainda não estão rastreados. Se o `.env` já estivesse no histórico antes do `filter-repo`, o `.gitignore` sozinho não resolveria.

### O que fazer se já tiver clonado o repositório

Se você está trabalhando no repositório local e não quer clonar de novo, pode usar o `filter-repo` diretamente no seu working directory:

```bash
# No diretório do projeto
git filter-repo --invert-paths --path .env --force

# O filter-repo remove os remotes por segurança, adicione novamente
git remote add origin https://github.com/seu-usuario/seu-repo.git

# Forçar o push
git push origin --force --all
```

O `filter-repo` vai reescrever o histórico e atualizar o seu working directory automaticamente. O arquivo `.env` vai sumir do histórico, mas vai continuar no seu disco (o que é bom, pois você ainda precisa dele para rodar o projeto localmente).

### Limpar o cache do Git

Às vezes você adiciona um arquivo ao `.gitignore`, mas o Git continua rastreando ele porque já estava no índice antes da regra existir. Para parar de rastrear sem deletar o arquivo:

```bash
# Remove do índice do Git, mas mantém o arquivo no disco
git rm --cached .env

# Commita a remoção do rastreamento
git commit -m "chore: remove .env do rastreamento"
```

Este `git rm --cached` é um comando salvador. Ele diz ao Git: "pare de rastrear este arquivo, mas não o delete do meu computador". É diferente de `git rm` sem o `--cached`, que deleta o arquivo tanto do Git quanto do disco.

## Outras situações comuns e como resolver

### Situação 1: Commitou uma pasta node_modules/

Você esqueceu de criar o `.gitignore` antes do primeiro commit e a pasta `node_modules/` com 50 mil arquivos entrou no repositório. Agora cada clone leva minutos e o repositório tem centenas de megabytes desnecessários.

```bash
# Remove a pasta do histórico completo
git filter-repo --invert-paths --path node_modules/ --force

# Adiciona ao .gitignore para nunca mais acontecer
echo "node_modules/" >> .gitignore
git add .gitignore
git commit -m "chore: adiciona node_modules ao .gitignore"

# Força o push com o histórico limpo
git push origin --force --all
```

O resultado é um repositório drasticamente menor. A pasta `node_modules/` some do histórico como se nunca tivesse existido.

### Situação 2: Commitou arquivos de IDE

Você commitou a pasta `.vscode/` com suas configurações pessoais. Agora todo mundo que clona o repositório recebe suas preferências de tema e atalhos.

```bash
# Remove as pastas de IDE do histórico
git filter-repo --invert-paths --path .vscode/ --path .idea/ --force

# Cria o .gitignore com múltiplas regras de uma vez
cat >> .gitignore << EOF
.vscode/
.idea/
*.swp
*.swo
EOF

git add .gitignore
git commit -m "chore: adiciona arquivos de IDE ao .gitignore"
git push origin --force --all
```

O `cat >> .gitignore << EOF` é um truque de shell que permite adicionar várias linhas de uma vez. O `EOF` marca o fim do texto.

### Situação 3: Commitou um arquivo grande

Você commitou acidentalmente um vídeo de demonstração de 100MB. O Git não foi feito para arquivos grandes, e agora cada clone puxa esse vídeo, deixando tudo lento.

```bash
# Primeiro, descubra os maiores arquivos no histórico
# Este comando lista os 20 maiores blobs (arquivos) do repositório
git rev-list --objects --all \
  | git cat-file --batch-check='%(objecttype) %(objectname) %(objectsize) %(rest)' \
  | awk '/^blob/ {print $3, $4}' \
  | sort -rn \
  | head -20

# Remove o arquivo grande
git filter-repo --invert-paths --path arquivo-grande.zip --force

# Adiciona uma regra genérica para evitar arquivos zip no futuro
echo "*.zip" >> .gitignore
git add .gitignore
git commit -m "chore: adiciona arquivos zip ao .gitignore"
git push origin --force --all
```

O comando para listar arquivos grandes é complexo, mas muito útil. Ele passa por todos os objetos do Git, filtra apenas os blobs (arquivos), mostra o tamanho em bytes e o caminho, ordena do maior para o menor, e pega os 20 primeiros.

## Templates prontos para usar

Se você quer começar rápido, aqui estão dois templates que servem como ponto de partida.

### Template universal (base para qualquer projeto)

```gitignore
# Sistema operacional: arquivos que o macOS e Windows
# criam automaticamente em pastas. Nada a ver com código.
.DS_Store
Thumbs.db
desktop.ini

# IDEs e editores: configurações pessoais. Cada dev usa
# o que preferir, não precisa impor ao time.
.vscode/
.idea/
*.swp
*.swo
*~

# Ambiente e credenciais: AQUI MORAM AS SENHAS.
# Nunca versione estes arquivos. Nunca.
.env
.env.local
.env.*.local
*.pem
*.key

# Logs: arquivos que crescem sem parar e são específicos
# da execução local. Cada máquina gera os seus.
*.log
logs/

# Arquivos de IA e assistentes: úteis para você, mas
# podem conter contexto interno da empresa.
CLAUDE.md
claude.md
.cursorrules
.cursor/

# Dependências (ajuste conforme a linguagem do projeto)
node_modules/
vendor/
__pycache__/
```

### Template para projetos web full stack

```gitignore
# Frontend: tudo que é gerado pelo build do frontend.
# O código fonte está em src/, o resto é gerado.
node_modules/
dist/
build/
.cache/
.parcel-cache/

# Backend: credenciais e banco de dados local.
# O SQLite é um arquivo binário que muda a cada request.
.env
.env.local
*.sqlite3

# Geral: arquivos do sistema, IDEs, logs, e arquivos de IA.
# Esta seção é praticamente igual para todos os projetos.
.DS_Store
.vscode/
.idea/
*.log
CLAUDE.md
.cursorrules

# Testes: relatórios de cobertura. São gerados automaticamente
# e não precisam ser versionados.
coverage/
.nyc_output/
```

## Boas práticas para manter o .gitignore saudável

1. **Crie o .gitignore no início do projeto**: Antes do primeiro commit, configure o que deve ser ignorado. É muito mais fácil prevenir do que remediar.

2. **Seja explícito**: Em vez de `*.log`, considere `logs/` se sua aplicação grava logs em uma pasta específica. Regras explícitas são mais fáceis de entender e manter.

3. **Documente exceções**: Se você faz uma exceção com `!`, adicione um comentário explicando por que. Daqui a seis meses, ninguém vai lembrar o motivo.

4. **Revise periodicamente**: Ferramentas novas criam arquivos novos. Quando você adota uma nova ferramenta, verifique se ela cria arquivos que devem ser ignorados.

5. **Use templates oficiais**: O GitHub mantém uma coleção excelente em github/gitignore. Eles são mantidos pela comunidade e cobrem praticamente todas as tecnologias.

6. **Teste antes de commitar**: Rode `git status` antes de `git add .` para ver o que será incluído. Este hábito simples evita 90% dos deslizes.

## Conclusão

O `.gitignore` é mais do que uma conveniência. É uma ferramenta de segurança que protege credenciais, mantém o repositório limpo, e evita conflitos entre desenvolvedores. Um bom `.gitignore` criado no início do projeto poupa horas de trabalho e evita situações embaraçosas.

Mas quando um deslize acontece, e ele vai acontecer, é importante saber que o `git filter-repo` existe. Ele permite reescrever o histórico e remover arquivos sensíveis de forma segura e eficiente. A chave é agir rápido: quanto mais tempo o arquivo sensível ficar no histórico, mais pessoas podem tê-lo clonado.

A regra de ouro é simples: configure o `.gitignore` antes do primeiro commit, revise o que vai ser commitado com `git status`, e nunca confie apenas em deletar um arquivo para remover algo do histórico do Git.

## Fontes e links

* [GitHub gitignore Templates](https://github.com/github/gitignore)
* [Documentação oficial do git filter-repo](https://github.com/newren/git-filter-repo)
* [Git Documentation - gitignore](https://git-scm.com/docs/gitignore)
* [GitHub Docs - Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)
* [Atlassian - Advanced Git Tutorials](https://www.atlassian.com/git/tutorials)
