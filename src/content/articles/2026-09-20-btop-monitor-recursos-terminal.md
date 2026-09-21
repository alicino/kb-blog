---
title: "btop: o monitor de recursos que falta no seu terminal"
description: "Aprenda a instalar e usar o btop, o monitor interativo de CPU, memória, discos, rede e GPU que transforma seu terminal em um painel de controle do sistema."
publishDate: 2026-09-20
author: "Alicino"
category: "Ferramentas"
tags: ["btop", "terminal", "monitor", "CPU", "GPU", "sistema", "diagnóstico", "Linux", "macOS"]
draft: false
---

<img src="/assets/img/2026-09-20-btop-monitor-recursos-terminal-1.png" alt="btop: monitor de recursos no terminal" style="width:80%;height:auto;display:block;margin:2rem auto" />

Você está trabalhando e o computador começa a ficar lento. O navegador demora para abrir uma aba. O compilador está demorando mais que o normal. O que está consumindo os recursos da sua máquina?

O `top` responde, mas o `top` padrão do terminal é difícil de ler. O `htop` é melhor, mas os gráficos são limitados. O [btop](https://github.com/aristocratos/btop) é a evolução natural dessas ferramentas: um monitor de sistema completo, bonito e rápido, com suporte total a mouse e temas customizáveis.

Ele mostra CPU, memória, discos, rede, GPU, processos e sensores em uma única tela. E faz isso com um visual que parece um jogo, com gráficos em tempo real e cores que facilitam a leitura.

Se você também usa o [Octomon](/artigos/octomon-ferramenta-diagnostico-rede-terminal/) para monitorar rede, os dois formam um conjunto completo: o Octomon cuida da conexão com o mundo, o btop cuida do que está rodando dentro da sua máquina.

## O que o btop mostra

<img src="/assets/img/2026-09-20-btop-monitor-recursos-terminal-2.jpg" alt="Tela do btop mostrando CPU, memória, discos, rede e processos em tempo real" style="width:80%;height:auto;display:block;margin:2rem auto" />

O btop divide a tela em painéis que você pode reorganizar. Cada painel mostra uma categoria de recurso.

**CPU.** Uso de cada núcleo com gráficos de barra e uma linha do tempo. O cálculo é inteligente: ele mostra a média ponderada no tempo em vez do valor instantâneo. Isso evita picos que desaparecem antes de você ler.

**Memória.** RAM e swap, com uso por processo e pressão de memória.

**Discos.** Taxa de leitura e escrita, espaço usado e atividade de IO.

**Rede.** Taxa de download e upload por interface.

**GPU.** (Linux) Uso, memória, temperatura e processos que estão usando a placa.

**Processos.** Lista interativa com ordenação por CPU, memória, PID ou nome. Você pode filtrar, matar processos e alternar para visualização em árvore para ver hierarquia de processos pai e filho.

**Sensores.** Temperaturas da CPU, GPU, discos e ventiladores.

Tudo é configurado por presets. Você pode salvar diferentes layouts e alternar entre eles com um atalho.

## Instalação

O btop está disponível para Linux, macOS e Windows. A forma mais simples de instalar é com o gerenciador de pacotes da sua distribuição.

### macOS

```bash
brew install btop
```

### Linux (Debian, Ubuntu, Mint)

```bash
sudo apt install btop
```

### Linux (Fedora)

```bash
sudo dnf install btop
```

### Linux (Arch)

```bash
sudo pacman -S btop
```

### Linux (OpenSUSE)

```bash
sudo zypper install btop
```

### Windows

```bash
winget install btop
```

Ou baixe o binário diretamente do [releases do GitHub](https://github.com/aristocratos/btop/releases).

### Docker

Também existe uma imagem Docker para ambientes que não permitem instalação direta:

```bash
docker run -it --pid=host --net=host ghcr.io/aristocratos/btop:latest
```

## Primeiros passos

Depois de instalado, execute:

```bash
btop
```

A interface abre em modo de tela cheia no terminal. Você pode navegar com o mouse ou com o teclado.

**Comandos essenciais:**

- `1` ou `2` alterna entre as visualizações de CPU (média, cada núcleo)
- `m` alterna entre visualização de memória (usada, livre, swap)
- `d` alterna entre visualização de discos
- `n` alterna entre visualização de rede
- `e` abre detalhes do processo selecionado
- `t` alterna visualização em árvore dos processos
- `f` abre o filtro de processos
- `k` envia um sinal para o processo selecionado
- `p` abre o menu de presets
- `ESC` volta ou sai do modo atual
- `q` ou `Ctrl+c` sai do btop
- `?` mostra a ajuda completa de teclado

**Mouse.** Todos os botões e itens com destaque são clicáveis. O scroll funciona na lista de processos e nos menus. Você pode clicar nas abas dos painéis para alternar entre eles.

## Exemplos de uso

### Descobrir qual processo está usando toda a CPU

Execute `btop` e observe o painel de processos. A ordenação padrão é por uso de CPU (maior para menor). O processo no topo é o responsável. Pressione `e` para ver detalhes: PID, comandos, threads, memória, e quanto tempo de CPU acumulou.

### Verificar se a memória RAM está acabando

O painel de memória mostra uma barra de uso total e uma lista dos principais consumidores. Se a barra de swap também estiver alta, significa que o sistema está começando a usar disco como memória. Isso causa lentidão. Os principais candidatos são navegadores com muitas abas, containers Docker e IDEs pesadas.

### Monitorar GPU enquanto treina um modelo de IA

Se você treina modelos localmente, o painel de GPU mostra uso, memória consumida e temperatura. Se a temperatura passar de 80 graus, o throttling térmico reduz a performance. Você pode ver isso em tempo real enquanto o treinamento roda.

### Criar um preset para monitoramento de servidor

O btop permite salvar presets com diferentes combinações de painéis. Para um servidor headless, um preset útil inclui CPU (todos os núcleos), memória, disco e rede. Sem processos e sem GPU. Pressione `p`, escolha um slot vazio, marque os painéis desejados e salve.

## Personalização

O btop é altamente customizável sem precisar editar arquivos de configuração manualmente. Pressione `p` para abrir o menu de presets e configure:

- Quais painéis aparecem e em que ordem
- Gráficos com símbolos diferentes (braile, blocos, linhas)
- Tema de cores (mais de 30 temas inclusos)
- Velocidade de atualização
- Ordenação e filtro de processos

O arquivo de configuração fica em `~/.config/btop/btop.conf`. Nele você pode ajustar manualmente opções como:

```bash
# Tema (nomes na pasta ~/.config/btop/themes/)
color_theme = "dracula"

# Símbolos dos gráficos: "braille", "block", "tty"
theme_background = false
graph_symbol = "braille"

# Ordenação padrão de processos: "cpu lazy", "cpu direct", "memory", "pid"
proc_sorting = "cpu lazy"

# Mostrar processos em árvore por padrão
proc_tree = false
```

### Temas

O btop vem com dezenas de temas prontos, incluindo Dracula, Nord, Monokai, Solarized, Catppuccin e Tokyo Night. Para alternar, use o atalho `Esc` e navegue até Options > Themes.

Você também pode criar seus próprios temas. Basta criar um arquivo `.theme` em `~/.config/btop/themes/` com as cores desejadas.

## Comparação com outras ferramentas

A principal alternativa ao btop é o `htop`, que é mais leve e está disponível em mais sistemas. O `top` padrão é o mínimo que toda máquina Unix tem.

| Funcionalidade | top | htop | btop |
|---|---|---|---|
| Gráficos de CPU | Não | Barra simples | Barras + linha do tempo |
| GPU | Não | Não | Sim (Linux) |
| Múltiplos painéis | Não | Não | Sim, reorganizáveis |
| Suporte a mouse | Não | Parcial | Completo |
| Temas | Não | Limitado | 30+ temas |
| Presets | Não | Não | Sim |
| Sensor de temperatura | Não | Não | Sim |
| Docker | Não | Não | Sim (imagem oficial) |

Para monitoramento de rede especificamente, o [Octomon](/artigos/octomon-ferramenta-diagnostico-rede-terminal/) é a ferramenta complementar ideal. Enquanto o btop mostra a taxa de transferência por interface, o Octomon detalha latência, DNS, Wi-Fi, bufferbloat e diagnostica se o problema é no provedor, na rede local ou no DNS. Os dois juntos cobrem hardware e conectividade.

## Limitações

O btop consome mais recursos que o `htop` ou `top`. Em máquinas muito limitadas (512 MB de RAM ou menos), o `htop` pode ser uma escolha melhor.

No macOS, o suporte a GPU é limitado porque a Apple não expõe essas métricas de forma padronizada. O painel de GPU só funciona completamente no Linux.

Algumas métricas de disco e rede dependem de permissões elevadas. Em containers Docker sem acesso ao host, você pode ver informações incompletas.

## Links úteis

- Repositório GitHub: [github.com/aristocratos/btop](https://github.com/aristocratos/btop)
- Documentação: [github.com/aristocratos/btop#readme](https://github.com/aristocratos/btop#readme)
- Releases e binários: [github.com/aristocratos/btop/releases](https://github.com/aristocratos/btop/releases)
- Temas da comunidade: [github.com/aristocratos/btop/wiki/Themes](https://github.com/aristocratos/btop/wiki/Themes)
- Octomon (diagnóstico de rede complementar): [octomon.dev](https://octomon.dev)

## Conclusão

O btop é a ferramenta que você instala uma vez e consulta sempre que algo no computador parece estranho. Ele substitui `top` e `htop` com uma interface mais informativa e prazerosa de usar. Os gráficos em tempo real, o suporte a mouse e os presets customizáveis fazem dele um item essencial no kit de ferramentas de qualquer pessoa que trabalha com tecnologia.

Combine com o [Octomon](/artigos/octomon-ferramenta-diagnostico-rede-terminal/) para diagnóstico de rede, e você tem um sistema completo de monitoramento local que não depende de dashboard web, agente remoto ou serviço de nuvem.