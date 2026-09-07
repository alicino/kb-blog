---
title: "Teste de Carga Moderno com k6: Scripts Leves, Resultados Sérios"
description: "Conheça o k6, a ferramenta open source da Grafana para teste de carga que usa JavaScript, integra com CI/CD e monitora desempenho com métricas granulares."
publishDate: 2026-09-09
category: "Ferramentas"
tags:
  - k6
  - teste-de-carga
  - performance
  - grafana
  - devops
  - javascript
language: "pt-BR"
hero:
  image: "/images/hero/k6-test-carga.svg"
  alt: "Ilustração do k6 simulando múltiplos usuários virtuais contra uma API"
---

O teste de carga sempre foi visto como uma daquelas áreas "só para especialistas" — ferramentas pesadas, interfaces cheias de botões, relatórios que ninguém sabia interpretar. Mas os tempos mudaram. Hoje, com arquiteturas baseadas em microsserviços, APIs públicas e deploys contínuos, saber como sua aplicação se comporta sob pressão não é mais um luxo: é parte do ciclo de desenvolvimento.

É nesse cenário que entra o **k6** (agora **Grafana k6**): uma ferramenta open source de teste de carga que trata testes como código, escreve cenários em JavaScript, e cabe em um binário único — sem dependências, sem JVM, sem IDE.

Se você já usou JMeter e sentiu que precisava de um curso só para entender a interface, ou tentou Locust e achou o ecossistema Python pesado para um teste rápido, o k6 vai te surpreender.

> Este artigo é um guia completo — desde a instalação até cenários avançados, com exemplos práticos e referências para você se aprofundar.

## O que é o k6?

O k6 é uma ferramenta de **teste de carga e performance** criada pela empresa k6 (adquirida pela Grafana Labs em 2021) e mantida como projeto open source desde 2016.

A ideia central é simples: você escreve um script em JavaScript (ou TypeScript), define quantos usuários virtuais vão acessar sua aplicação, e o k6 executa o teste gerando relatórios com métricas como tempo de resposta, taxa de erro e throughput.

O que torna o k6 especial é a **arquitetura**: ele é escrito em Go, e cada usuário virtual roda como uma goroutine — um mecanismo leve de concorrência. Isso significa que uma única máquina pode simular **milhares de usuários simultâneos** sem consumir os recursos que um JMeter, por exemplo, precisaria.

> **Fonte oficial:** [k6.io — Load testing for engineering teams](https://k6.io/)
>
> **Repositório GitHub:** [github.com/grafana/k6](https://github.com/grafana/k6) — mais de 30 mil estrelas

## Para que serve o k6? (Cenários de uso)

O k6 pode ser usado em várias situações, todas relacionadas a entender os limites da sua aplicação:

### Teste de performance em APIs
O uso mais comum. Você simula requisições HTTP (GET, POST, PUT, DELETE) contra endpoints da sua API e mede como eles se comportam sob carga. O k6 suporta HTTP/1.1 e HTTP/2 nativamente.

### Teste de stress e breakpoint
Quer saber até onde sua aplicação aguenta antes de cair? O k6 permite aumentar gradualmente o número de usuários até o sistema começar a falhar — o famoso "breakpoint test".

### Teste de pico (spike test)
Simule eventos como Black Friday, lançamento de produto ou uma campanha de e-mail que dispara milhares de acessos simultâneos em segundos.

### Teste de resistência (soak test)
Coloque carga moderada por horas (ou dias) para detectar vazamentos de memória, degradação gradual de performance e problemas que só aparecem com tempo de execução prolongado.

### Teste em pipelines de CI/CD
Integre o k6 diretamente no GitHub Actions, GitLab CI ou qualquer outro pipeline. Defina thresholds (limiares) como "p95 menor que 500ms" e o teste falha automaticamente se o sistema não atingir a meta.

### Teste de WebSocket e gRPC
Além de HTTP, o k6 suporta testes com WebSockets (conexões persistentes) e gRPC (chamadas RPC modernas) — dois protocolos cada vez mais comuns em aplicações reativas e microsserviços.

> **Fonte oficial:** [Grafana k6 — Testing guides](https://grafana.com/docs/k6/latest/testing-guides/)

## Como instalar o k6

A instalação é trivial em qualquer sistema. O k6 é um binário único, sem dependências externas.

### Linux (Debian/Ubuntu)

```bash
curl -fsSL https://dl.k6.io/key.gpg | sudo gpg --dearmor -o /usr/share/keyrings/k6-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/k6-archive-keyring.gpg] https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

### macOS (Homebrew)

```bash
brew install k6
```

### Windows (Chocolatey)

```powershell
choco install k6
```

### Docker

```bash
docker pull grafana/k6
```

Após instalar, confirme com `k6 version` no terminal.

> **Fonte oficial:** [Grafana k6 — Install k6](https://grafana.com/docs/k6/latest/set-up/install-k6/)

## Seu primeiro teste de carga

Vamos começar com algo simples: um script que faz requisições GET para uma URL e mede o tempo de resposta.

```javascript
import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  vus: 10,
  duration: '30s',
};

export default function () {
  http.get('https://test-api.k6.io');
  sleep(1);
}
```

O código abaixo é gerado pelo modelo. Você não precisa escrevê-lo.

```javascript
// Código gerado pelo modelo, não por você
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,           // 10 usuários virtuais simultâneos
  duration: '30s',   // por 30 segundos
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% das requisições em <500ms
    http_req_failed: ['rate<0.01'],    // menos de 1% de erro
  },
};

export default function () {
  const res = http.get('https://test-api.k6.io');

  check(res, {
    'status é 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

### Como isso funciona na prática

Quando você executa `k6 run script.js`, o k6:

1. Inicia 10 usuários virtuais (VUs) simultâneos
2. Cada VU executa a função `default` em loop
3. A cada iteração, faz uma requisição GET e espera 1 segundo (simulando o "tempo de思考" de um usuário real)
4. Ao final, exibe um relatório completo no terminal

### Resultado esperado

O relatório mostra métricas como:

- `http_req_duration` — tempo total da requisição (média, mediana, p90, p95, p99)
- `http_req_failed` — percentual de requisições que falharam
- `http_reqs` — requisições por segundo (throughput)
- `vus` — número de usuários virtuais ao longo do tempo

```
    http_req_duration..............: avg=145ms   p(95)=320ms  p(99)=580ms
    http_req_failed...............: 0.00%
    http_reqs......................: 284   9.47/s
    vus............................: 10    min=10  max=10
```

## Thresholds: transformando métricas em decisões

Uma das funcionalidades mais úteis do k6 são os **thresholds** — limites que você define no próprio script. Se a métrica ultrapassar o limite, o k6 retorna código de saída diferente de zero, fazendo o pipeline de CI falhar.

```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    http_req_connecting: ['p(95)<100'],
  },
};
```

Isso significa:
- 95% das requisições devem responder em menos de 500ms
- 99% em menos de 1000ms
- Menos de 1% de falha
- Tempo de conexão deve ficar abaixo de 100ms para 95% dos casos

> **Fonte oficial:** [Grafana k6 — Thresholds](https://grafana.com/docs/k6/latest/using-k6/thresholds/)

## Cenários e executors: simulando tráfego real

O k6 permite configurar **cenários** com diferentes **executors** — formas de aumentar ou diminuir a carga. Você pode simular desde um crescimento suave de usuários até um pico abrupto.

### Carga crescente (ramping VUs)

```javascript
export const options = {
  scenarios: {
    carga_gradual: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 50 },   // sobe para 50 usuários em 2 min
        { duration: '5m', target: 50 },   // mantém por 5 min
        { duration: '2m', target: 100 },  // sobe para 100
        { duration: '5m', target: 100 },  // mantém
        { duration: '2m', target: 0 },    // rampa down
      ],
    },
  },
};
```

### Pico repentino (spike)

```javascript
export const options = {
  scenarios: {
    pico: {
      executor: 'ramping-vus',
      stages: [
        { duration: '10s', target: 5 },    // base
        { duration: '5s', target: 500 },   // PICO! 500 usuários em 5 segundos
        { duration: '30s', target: 500 },  // sustenta
        { duration: '30s', target: 0 },    // recupera
      ],
    },
  },
};
```

> **Fonte oficial:** [Grafana k6 — Scenarios](https://grafana.com/docs/k6/latest/using-k6/scenarios/)

### Tipos de teste de carga

A documentação oficial do k6 define seis tipos principais de teste:

| Tipo | Objetivo | Perfil de carga |
|------|----------|-----------------|
| **Smoke test** | Verificar se o script funciona | 1-5 VUs, poucas iterações |
| **Average-load** | Comportamento com tráfego típico | Carga de produção esperada |
| **Stress** | Comportamento acima do normal | 50-100% acima da média |
| **Spike** | Picos repentinos de tráfego | Subida abrupta, sem platô |
| **Breakpoint** | Encontrar o ponto de ruptura | Rampa contínua até falhar |
| **Soak** | Degradação ao longo do tempo | Carga média por horas/dias |

> **Fonte oficial:** [Grafana k6 — Test types](https://grafana.com/docs/k6/latest/testing-guides/test-types/)

## Além do HTTP: WebSocket, gRPC e Browser

O k6 não é só para APIs REST. Ele suporta nativamente outros protocolos:

### WebSocket

```javascript
import ws from 'k6/ws';
import { check } from 'k6';

export default function () {
  const url = 'ws://localhost:8080/chat';
  const response = ws.connect(url, function (socket) {
    socket.on('open', () => console.log('conectado'));
    socket.on('message', (data) => console.log('recebido:', data));
    socket.send('Olá servidor!');
    socket.close();
  });
}
```

### gRPC

```javascript
import grpc from 'k6/net/grpc';

const client = new grpc.Client();
client.load(['definitions'], 'hello.proto');

export default function () {
  client.connect('localhost:50051', {});
  const response = client.invoke('hello.HelloService/SayHello', {
    greeting: 'mundo',
  });
  check(response, {
    'status OK': (r) => r.status === grpc.StatusOK,
  });
  client.close();
}
```

### Browser testing (e2e)

Com o módulo `k6/browser`, você pode simular interações reais de usuário no navegador — cliques, navegação, formulários — enquanto mede métricas de frontend como First Contentful Paint (FCP) e Cumulative Layout Shift (CLS).

```javascript
import { browser } from 'k6/browser';

export default async function () {
  const page = await browser.newPage();
  await page.goto('https://test.k6.io');
  await page.locator('a[href="/my_messages.php"]').click();
  await page.close();
}
```

> **Fonte oficial:** [Grafana k6 — Using k6 browser](https://grafana.com/docs/k6/latest/using-k6-browser/)

## Métricas e observabilidade

O k6 gera métricas automaticamente para cada teste. As principais são:

- `http_req_duration` — duração total (conexão + TLS + envio + espera + recebimento)
- `http_req_failed` — requisições com status >= 200 e < 200? Na verdade, falhas são requisições que retornaram erro ou timeout
- `http_reqs` — taxa de requisições por segundo
- `vus` — número de usuários virtuais ativos
- `iteration_duration` — tempo total de cada iteração do script

Você pode criar **métricas customizadas** para monitorar aspectos específicos do seu negócio:

```javascript
import { Counter } from 'k6/metrics';

const loginFalhos = new Counter('login_falhos');

export default function () {
  const res = http.post('https://api.exemplo.com/login', {
    usuario: 'teste', senha: 'errada',
  });

  if (res.status !== 200) {
    loginFalhos.add(1);
  }
}
```

Os resultados podem ser exportados para JSON, InfluxDB, Prometheus ou diretamente para o **Grafana Cloud** — integração nativa que dispensa configuração extra.

> **Fonte oficial:** [Grafana k6 — Metrics](https://grafana.com/docs/k6/latest/using-k6/metrics/)

## k6 vs outras ferramentas

Como o k6 se compara às alternativas populares em 2026? Aqui vai um resumo baseado em análises técnicas recentes:

| Característica | k6 | JMeter | Gatling | Locust |
|---|---|---|---|---|
| **Linguagem** | JavaScript/TypeScript | Java (GUI + XML) | Scala/Java/Kotlin | Python |
| **Modelo de concorrência** | Goroutines (leves) | Thread por VU (pesado) | Async (Akka/Netty) | Greenlets (gevent) |
| **Protocolos nativos** | HTTP, gRPC, WS, Browser | HTTP, JDBC, JMS, LDAP, FTP, SMTP | HTTP, WS, SSE | HTTP (extensível) |
| **CI/CD** | Excelente (nativo) | Médio (requer setup) | Bom | Bom |
| **Performance por máquina** | Muito alta | Média | Alta | Alta |
| **Licença** | AGPL-3.0 | Apache 2.0 | Apache 2.0 | MIT |

O k6 se destaca quando:

- Sua equipe já escreve JavaScript
- Você quer integrar testes de carga no pipeline de CI/CD
- Precisa de alta densidade de usuários (milhares) em uma única máquina
- Valoriza experiência do desenvolvedor (scripts versionados, thresholds declarativos)

JMeter ainda é referência para protocolos além de HTTP (JDBC, JMS, LDAP) e para equipes de QA que preferem interface gráfica. Locust é a melhor escolha se sua equipe já trabalha com Python e precisa de testes distribuídos sem custo de cloud.

> **Fontes:**
>
> - [QAInsights — JMeter vs k6 vs Locust in 2026](https://qainsights.com/jmeter-vs-k6-vs-locust-in-2026-which-load-testing-tool-should-you-pick/)
> - [Tech Insider — Load Testing Tools 2026: k6 vs JMeter vs Gatling](https://tech-insider.org/k6-vs-jmeter-vs-gatling-2026/)
> - [YoungJu.dev — Load Testing Tools 2026 — Deep Dive](https://www.youngju.dev/blog/culture/2026-05-14-load-testing-tools-2026-k6-locust-vegeta-gatling-artillery-jmeter-comparison-deep-dive.en)
> - [Ranorex — Load Testing Tools Compared](https://www.ranorex.com/blog/load-testing-tools/)

## k6 na prática: exemplos de empresas

Organizações como **Cloudflare**, **Citibank**, **Informatica**, **MIT** e muitas outras usam k6 em produção. O caso mais emblemático talvez seja a própria **Grafana Labs**, que oferece o **Grafana Cloud k6** — uma plataforma SaaS para execução de testes em escala, com dashboards integrados e suporte a milhões de usuários virtuais distribuídos geograficamente.

Com o k6, é possível:

- Rodar testes de smoke em cada pull request (segundos)
- Executar testes completos de carga a cada merge na main (minutos)
- Agendar testes de soak que duram horas para detectar degradação
- Correlacionar métricas de carga com logs e traces no ecossistema Grafana

> **Fonte:** [Grafana k6 — OSS page](https://grafana.com/oss/k6/)

## Vídeos recomendados

Para quem prefere aprender visualmente:

1. **Grafana k6 for Beginners** — [Assistir no YouTube](https://www.youtube.com/watch?v=1mtYVDA2_iQ) — Playlist oficial da Grafana
2. **Introducing Grafana Cloud k6** — [Assistir no YouTube](https://www.youtube.com/watch?v=HyM4lNZjKqk)
3. **Getting Started with API Load Testing** (Nick) — Demonstração prática com k6, cobrindo stress, spike, load e soak tests

> Todos os links foram verificados nas fontes oficiais da Grafana e em canais técnicos relevantes.

## Conclusão

O k6 representa uma mudança de paradigma no teste de carga. Ele não é apenas mais uma ferramenta — é uma abordagem que trata **performance como requisito de software**, com testes versionados, automatizados e integrados ao ciclo de desenvolvimento.

Se você trabalha com APIs, microsserviços ou aplicações web, e ainda não tem testes de carga no seu pipeline, o k6 é provavelmente o caminho mais curto entre "não testamos performance" e "nosso sistema aguenta o tranco".

Comece pequeno: um script de 10 linhas, um threshold, um commit. Depois expanda. O importante é **começar**.

### Links úteis

- [Site oficial k6](https://k6.io/)
- [Documentação completa](https://grafana.com/docs/k6/latest/)
- [Repositório GitHub](https://github.com/grafana/k6)
- [Grafana Cloud k6](https://grafana.com/products/cloud/k6/)
- [Fórum da comunidade](https://community.grafana.com/)
- [Guia de teste de carga com k6 (Flavio Copes)](https://flaviocopes.com/k6-load-testing-tutorial/)
- [Tutorial k6 + CI/CD (QA Practices)](https://qapractices.com/documentation/k6-load-testing-tutorial/)
- [Tutorial k6 + Grafana Cloud 2026 (QASkills.sh)](https://qaskills.sh/blog/k6-grafana-cloud-load-testing-tutorial-2026/)
- [Baeldung — How to Execute Load Tests Using k6](https://www.baeldung.com/k6-framework-load-testing)