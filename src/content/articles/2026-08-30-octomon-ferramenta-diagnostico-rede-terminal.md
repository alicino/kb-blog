---
title: "Octomon: diagnóstico de rede no terminal para descobrir se é o Wi-Fi, o provedor ou a internet"
description: "Conheça o Octomon, uma ferramenta de terminal que mostra latência, banda, Wi-Fi e DNS em um único painel e diz qual camada da sua conexão está falhando."
publishDate: 2026-08-30
author: "Alicino"
category: "Ferramentas"
tags: ["rede", "terminal", "diagnóstico", "Octomon", "monitoramento", "macOS", "Linux", "DNS"]
draft: false
---

Todo mundo que mexe com tecnologia conhece o ritual. A internet começa a ficar
lenta, uma página não carrega, uma chamada de vídeo trava. Então você abre o
ping para ver se o gateway responde. Depois abre um traceroute para ver onde
está o gargalo. Confere o sinal do Wi-Fi no menu do sistema. Abre o
speedtest.cloudflare.com no navegador para medir a banda. Verifica se o DNS
está resolvendo. No final, você tem respostas espalhadas por cinco janelas
diferentes e ainda não sabe ao certo o que está acontecendo.

O [Octomon](https://octomon.dev) resolve exatamente esse problema. Ele junta
todas essas medições em uma única tela de terminal e ainda oferece algo que
nenhuma ferramenta separada faz: uma análise única que nomeia a camada que
está falhando.

## O que o Octomon faz

O Octomon é um dashboard no estilo do `btop`, aqueles painéis coloridos que
atualizam em tempo real no terminal, mas voltado inteiramente para rede. Ele
mostra quatro painéis principais com informações detalhadas e, abaixo deles,
uma linha de análise que diz de forma direta o estado da sua conexão.

Os quatro painéis são:

**Qualidade da conexão.** Latência ICMP para alvos configuráveis com médias,
p95, máximo, jitter e perda de pacotes. Uma nota de bufferbloat. E a mesma
medição sobre conexões TCP na porta 443, que continuam funcionando quando o
ping está sendo bloqueado pela rede.

**Banda.** Taxa de transferência ao vivo, um teste de velocidade sob demanda e
a lista de processos que mais estão usando a rede, ou o tráfego organizado por
endereço remoto.

**Rede.** Interface ativa, tipo de conexão (Wi-Fi, Ethernet, celular, VPN),
endereços, gateway IPv4 e IPv6, resolução de DNS com tempo de resposta para
cada resolvedor, SSID e canal do Wi-Fi, congestionamento do espectro, e
informações sobre proxy, relógio, path-MTU e NAT.

**Máquina.** Seu próprio computador como possível gargalo: CPU com o núcleo
mais carregado, pressão de memória, carga, erros de interface e thermal
throttling.

## O que ele detecta além dos gráficos

O Octomon não apenas mostra números. Ele interpreta o que está vendo e destaca
situações específicas que ferramentas comuns ignoram.

Ele identifica quando você não está conectado, quando não há rota padrão, o
endereço é um 169.254 auto-atribuído, ou há um endereço sem gateway. E nomeia
a causa como tal, não como "falha no downstream".

Ele detecta portais cativos, quando a web está bloqueada mas o ping funciona,
quando o IPv6 está quebrado mas o IPv4 funciona, e onde exatamente a quebra
acontece. Também detecta proxy HTTP configurado no sistema.

Para DNS, ele não mede apenas velocidade. Ele faz uma verificação de
honestidade: consulta um resolvedor público de referência junto com o seu.
Se o seu falha e o de referência funciona, a resposta é "troque de DNS". Se o
contrário acontece, significa que a rede está forçando o uso do DNS dela. E a
cada minuto ele verifica se nomes que não existem retornam NXDOMAIN em vez de
uma página de anúncios, algo comum em provedores que sequestram consultas
DNS.

Também detecta skew de relógio via NTP, CGNAT ou double NAT pelos primeiros
saltos, path-MTU black holes e portas de saída bloqueadas (SSH, SMTP,
DNS-over-TLS, NTP, QUIC).

## Memória por rede e incidentes

Uma das funcionalidades mais úteis do Octomon é que ele aprende o que é normal
para cada rede que você usa. Ele mantém uma linha de base persistente e um
histórico de incidentes. Quando algo acontece, ele pode dizer "pior que o
normal aqui" e "três quedas nesta semana, concentradas entre 20h e 23h".

O histórico fica visível em uma barra de sessão na tela. Cada fatia de tempo
da execução atual é colorida: verde para normal, amarelo para degradado,
vermelho para queda. A barra se adapta ao tamanho da sessão, então uma
execução de nove horas em um voo ocupa o mesmo espaço que uma verificação de
cinco minutos. Você pode navegar pela barra para ver o que estava errado em
cada momento.

## Como instalar

No macOS, a instalação é feita via Homebrew:

```bash
brew tap securitypedant/octomon
brew trust securitypedant/octomon
brew install octomon
```

No Debian e Ubuntu, o repositório é assinado:

```bash
curl -fsSL https://octomon.dev/apt/octomon.gpg | sudo tee /usr/share/keyrings/octomon.gpg >/dev/null
echo "deb [signed-by=/usr/share/keyrings/octomon.gpg] https://octomon.dev/apt stable main" | sudo tee /etc/apt/sources.list.d/octomon.list
sudo apt update && sudo apt install octomon
```

Em outras distribuições Linux, binários estáticos (musl) funcionam em
qualquer distribuição. O instalador escolhe a arquitetura correta e coloca o
binário em `~/.cargo/bin`:

```bash
curl --proto '=https' --tlsv1.2 -LsSf \
  https://github.com/securitypedant/octomon/releases/latest/download/octomon-installer.sh | sh
```

No Windows, o instalador PowerShell funciona para x64 e ARM64:

```powershell
irm https://github.com/securitypedant/octomon/releases/latest/download/octomon-installer.ps1 | iex
```

E para instalar a partir do código fonte via Rust:

```bash
cargo install octomon
```

## Como usar

Com o Octomon instalado, basta executar:

```bash
octomon
```

Isso abre o dashboard completo no terminal. Todas as medições começam
automaticamente.

Para uma verificação rápida sem abrir a interface, use o modo doutor:

```bash
octomon --doctor
```

Ele observa a rede por cerca de 20 segundos e imprime uma análise completa
no terminal. Útil para anexar em chamados de suporte do provedor. O modo
`--json` retorna a análise em formato JSON. Ele redaciona SSID, IPs e MACs
por padrão, para que seja seguro compartilhar. Use `--full` para ver todos os
dados.

Para monitoramento contínuo em segundo plano:

```bash
octomon --watch
```

Isso executa sem a interface e imprime cada achado na saída padrão conforme
ele aparece e quando é resolvido. Combine com `--alert` para notificações no
desktop, `--alert-cmd` para executar um comando quando algo acontecer, ou
`--alert-url` para enviar um POST JSON para um webhook.

## Por que você deveria instalar o Octomon

Se você gerencia sua própria rede em casa, trabalha com infraestrutura, ou
simplesmente quer entender o que está acontecendo quando a internet fica
lenta, o Octomon substitui o ritual de abrir cinco ferramentas diferentes.

Poucas ferramentas de terminal oferecem:

1. Uma análise consolidada. Em vez de olhar números isolados, você tem uma
   linha dizendo "gateway não responde" ou "conexão saudável", com o
   diagnóstico completo a um pressionar de tecla.

2. Detecção de problemas que ferramentas comuns ignoram. DNS sequestrado,
   portal cativo, CGNAT, bufferbloat, path-MTU black holes, proxy forçado.
   O Octomon procura por todos eles automaticamente.

3. Memória por rede. A ferramenta aprende o que é normal para cada rede que
   você usa e mantém um histórico de incidentes. Isso transforma "a internet
   está lenta" em "está pior que o normal para esta rede, e houve quedas
   similares nos últimos dias no mesmo horário".

4. Doctor mode seguro para compartilhar. Um comando gera um relatório
   completo da sua conexão com dados sensíveis redacionados por padrão.
   Perfeito para enviar ao suporte do provedor ou para fóruns de ajuda.

5. Funciona sem privilégios. O Octomon roda sem sudo na maioria das
   plataformas. No macOS, tudo funciona sem elevar privilégios. No Linux,
   apenas a medição de processo por processo da banda pode precisar de
   sudo.

## Onde saber mais

O repositório oficial está no GitHub em
[securitypedant/octomon](https://github.com/securitypedant/octomon). O site
oficial é [octomon.dev](https://octomon.dev), que inclui instruções de
instalação detalhadas e links para releases. Há também um
[vídeo de introdução](https://www.youtube.com/watch?v=sHPd2LeYvaw) que
explica o propósito da ferramenta e mostra uma visita guiada pela interface.

## Conclusão

O Octomon é uma ferramenta que resolve um problema real de forma elegante.
Em vez de espalhar o diagnóstico entre ping, traceroute, ifconfig, speed test
e monitor de atividade, ele junta tudo em uma única tela com uma análise que
realmente ajuda a entender o que está acontecendo. Para quem trabalha com rede
ou simplesmente quer deixar de chutar quando a internet falha, vale a
instalação.

A ferramenta é código aberto (licença MIT ou Apache 2.0), escrita em Rust, e
funciona em macOS, Linux e Windows.