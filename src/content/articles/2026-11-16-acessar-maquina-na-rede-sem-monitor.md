---
title: "Acessar sua máquina na rede sem levantar do sofá"
description: "Como acessar um servidor, Raspberry Pi ou container que está na sua própria rede, sem plugar monitor. Nomes que funcionam, o que quebra no Docker e por que .local tem limite."
publishDate: 2026-11-16
author: "Alicino"
category: "Infraestrutura e Redes"
tags: ["rede doméstica", "mDNS", "Docker", "servidor caseiro", "Raspberry Pi", "acesso remoto"]
draft: true
---

<img src="/assets/img/2026-11-16-acessar-maquina-na-rede-sem-monitor-1.png" alt="Capa sobre acessar uma máquina na rede local sem monitor: servidor em casa, nome .local e portas do Docker" width="1200" height="333" />

Você montou um servidor em casa, ligou o cabo de rede e colocou ele num canto. Agora precisa acessar e descobre o problema: sem monitor, sem teclado, sem ideia de qual endereço usar.

Esse é o cenário mais comum de quem tem um computador parado rodando alguma coisa. Um Raspberry Pi com o Pi-hole, um mini PC com arquivos, um container com o Home Assistant, uma máquina antiga que ficou de servidor. Todos com o mesmo problema: você não quer ir até ele.

A boa notícia é que só precisa resolver duas coisas. Um nome para não decorar número, e uma porta publicada do jeito certo. A má notícia é que cada uma tem uma armadilha específica, e é sobre elas que este post trata.

## O problema com endereços IP

O caminho que quase todo mundo tenta primeiro é usar o IP direto. Algo como `192.168.1.198`. Funciona, e é por isso que engana.

Três motivos pelos quais ele para de servir:

1. **Você precisa lembrar.** Um servidor ainda vai, mas quando são dois ou três, ninguém lembra qual é qual.
2. **O IP pode mudar.** Mesmo com reserva no roteador, uma troca de equipamento ou um reset devolve o endereço para a faixa dinâmica.
3. **Ninguém mais consegue usar.** Quando alguém da casa quer acessar, "digita 192.168.1.198" não é uma instrução razoável.

O caminho mais elegante é dar um nome à máquina e deixar a rede resolver. E aqui entra a parte que quase ninguém explica direito.

## .local, .lan, .home: o que realmente funciona

Você vai encontrar na internet gente recomendando `.local`, `.lan`, `.home`, `.intranet`, `.rede`. A diferença entre eles não é de gosto. É de quem responde pela tradução do nome.

Testei na minha própria rede, e o resultado é claro. Do Mac onde escrevo, com a rede funcionando normalmente:

```
mac-mini-server.local       -> 192.168.1.198   ok
mac-mini-server.lan         -> não resolve
mac-mini-server.intranet    -> não resolve
mac-mini-server.rede        -> não resolve
mac-mini-server.home        -> não resolve
```

Só o `.local` funcionou **sem eu configurar nada**. Os outros quatro não resolvem porque ninguém na rede sabe responder por eles.

### Por que o .local é especial

O `.local` não é um apelido simpático para rede interna. É um domínio reservado por norma, e a norma é a **RFC 6762**, de 2013.

A RFC diz o seguinte, em tradução direta: qualquer nome terminado em `.local` é *link-local*, e nomes nesse domínio só têm significado no link onde se originam. Ela compara isso com os endereços `192.168.x.x` e `169.254.x.x`, que também só valem dentro da sua rede.

E define a regra que faz tudo funcionar: **toda consulta por um nome terminado em `.local` deve ser enviada por multicast**, para o endereço `224.0.0.251`, na porta `5353`. Nenhum servidor central responde. Cada máquina se anuncia e responde por si mesma.

Esse mecanismo tem nome: **mDNS**, ou Bonjour, no vocabulário da Apple. No seu Mac ou iPhone, ele já está rodando de fábrica. É por isso que só o `.local` funcionou no meu teste.

O nome que o `.local` usa vem do próprio sistema. No macOS, é o "nome de host local" em Ajustes, e dá para ver pelo terminal:

```bash
scutil --get LocalHostName
```

```text
mac-mini-server
```

### Por que .lan e .home não funcionam sozinhos

`.lan`, `.home`, `.intranet`, `.internal`, `.private` e `.corp` também são sufixos de uso privado. A RFC 6762 os cita nominalmente como opções para redes internas.

Mas tem uma diferença que muda tudo: **nenhum deles tem um protocolo associado**. O `.local` foi casado com o mDNS por norma. Os outros são só nomes que a comunidade combinou de usar.

Isso significa que eles **só funcionam se existir um servidor DNS na sua rede respondendo por eles**. Sem esse servidor, seu computador pergunta ao roteador, o roteador não conhece o nome, e a consulta falha. É exatamente o que os quatro erros do meu teste mostram.

Quando você quiser usar `.lan` ou um domínio próprio como `casa.lab`, o caminho é montar DNS interno. Vale saber que, para uso doméstico, existe um sufixo com respaldo em norma, definido pela **RFC 8375**: o `.home.arpa`, criado justamente para não colidir com nada.

### Válvula de escape quando nada resolve

Se o nome não resolve e você não quer configurar nada, tem uma saída no próprio computador de origem:

```bash
sudo tee -a /etc/hosts <<'EOF'
192.168.1.198   servidor.home
EOF
```

Isso funciona na máquina onde você editou, e só nela. É útil como teste, para confirmar que o problema é a resolução de nome e não a conexão. Mas não escala: cada aparelho novo precisa da mesma linha, e o IP pode mudar.

## A armadilha do Docker

Aqui está a parte que faz muita gente concluir, errado, que "o container não funciona na rede".

Vou mostrar com uma medição. Subi dois containers nginx idênticos, na mesma máquina, mudando **uma coisa só** na forma de publicar a porta:

```bash
# container A: preso no loopback
docker run -d --name teste-loopback -p 127.0.0.1:8081:80 nginx:alpine

# container B: todas as interfaces
docker run -d --name teste-all -p 8082:80 nginx:alpine
```

Repare na diferença. No container A eu escrevi `127.0.0.1:8081:80`. No B, só `8082:80`, sem o endereço na frente.

O Docker registra a diferença com clareza:

```text
teste-loopback   127.0.0.1:8081->80/tcp
teste-all        0.0.0.0:8082->80/tcp, [::]:8082->80/tcp
```

`127.0.0.1` é o loopback: só a própria máquina. `0.0.0.0` é todas as interfaces, ou seja, todo mundo que alcança essa máquina na rede.

### A medição

Testei conexão nos dois, do mesmo jeito. O resultado:

```text
127.0.0.1:8081          conectou    (loopback, preso no host)
192.168.1.198:8081     RECUSOU     (IP da LAN chegando no loopback)
mac-mini-server.local:8081  RECUSOU     (via nome, mesmo destino)

127.0.0.1:8082          conectou    (all-interfaces)
192.168.1.198:8082     conectou    (IP da LAN)
mac-mini-server.local:8082  conectou    (via nome)
```

Leia a segunda linha com atenção. O endereço da máquina na rede **recusou** conexão para a porta 8081, mesmo com o container rodando e respondendo em `127.0.0.1:8081`.

Isso explica o sintoma que confunde. Você entra na máquina, testa `curl localhost:8081`, funciona, e conclui que está tudo certo. Do notebook, no sofá, não abre. Você culpa o firewall, o roteador, o mDNS. O problema estava no primeiro comando.

### A regra

Ao publicar porta no Docker, **não escreva endereço na frente** a menos que queira restringir:

```bash
# acessível pela rede (o que você quer na maioria dos casos)
-p 8082:80

# só nesta máquina (para bancos e serviços internos)
-p 127.0.0.1:5432:5432
```

A segunda forma tem uso legítimo. Um banco de dados que só a aplicação local acessa **deve** ficar em `127.0.0.1`, porque ninguém mais precisa falar com ele e o loopback reduz a superfície exposta. A regra não é nunca usar, é escolher sabendo qual efeito tem.

### A ordem da porta

Uma confusão que aparece logo depois. O formato é `porta-de-fora:porta-de-dentro`:

```bash
-p 8080:80
```

Isso quer dizer: chega na porta 8080 da sua máquina, entrega na 80 do container. As duas não são a mesma coisa. O container tem o próprio sistema de portas, isolado.

E aqui tem um detalhe sobre o `.local` que vale saber: o nome resolve para o endereço da **máquina**, nunca para o container. Você publica uma porta para que o container fique alcançável naquele endereço. O container não ganha um `.local` próprio, porque mDNS anuncia interfaces de rede, e um container não tem interface na sua LAN por padrão.

## Fechando o essencial

Para o caso de acesso dentro da própria rede, três passos resolvem:

1. **Nome:** no macOS e aparelhos com Bonjour, use `.local` e nada mais é necessário. Confira o nome com `scutil --get LocalHostName`.
2. **Porta:** publique sem endereço na frente, `-p 8082:80`, para a rede alcançar.
3. **Teste do outro dispositivo, sempre.** O teste que vale é de outro aparelho, nunca de `localhost` na própria máquina.

## O que este post deixa para depois

Duas coisas ficaram de fora, e é honesto dizer por quê.

Quando você quer um nome fixo em vários aparelhos, com `.lan` ou `casa.lab`, precisa de DNS interno. E quando quer endereço bonito, sem número de porta no fim, precisa de um proxy reverso na frente. Os dois merecem post próprio, com servidor montado de verdade.

Fica também uma limitação que já apareceu no teste: tudo o que foi mostrado funciona **só dentro da sua rede**. O `.local` é link-local por definição, o que é a razão de ele ser simples e, ao mesmo tempo, o motivo de ele não funcionar de fora. É característica, não defeito.

## Fontes e links

- [RFC 6762: Multicast DNS](https://www.rfc-editor.org/rfc/rfc6762.txt) (IETF, fevereiro de 2013), que reserva o `.local` para mDNS, define o multicast em `224.0.0.251:5353` e cita `.intranet`, `.internal`, `.private`, `.corp`, `.home` e `.lan` como sufixos usados em redes privadas
- [RFC 8375: Special-Use Domain 'home.arpa.'](https://www.rfc-editor.org/rfc/rfc8375.txt) (IETF, maio de 2018), que designa um sufixo com respaldo em norma para uso residencial
- [RFC 6761: Special-Use Domain Names](https://www.rfc-editor.org/rfc/rfc6761.txt) (IETF, fevereiro de 2013), que define o tratamento especial de nomes com propriedades universais
- [Documentação do Docker: publicação de portas](https://docs.docker.com/engine/network/#published-ports), sobre a diferença entre publicar em `127.0.0.1` e em todas as interfaces
