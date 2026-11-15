---
title: "Modern Load Testing with k6: Lightweight Scripts, Serious Results"
description: "Get to know k6, Grafana's open source load testing tool that uses JavaScript, integrates with CI/CD and monitors performance with granular metrics."
publishDate: 2026-09-09
author: "Alicino"
category: "Ferramentas"
tags: ["k6", "load-testing", "performance", "grafana", "devops", "javascript"]
draft: false
---

<img src="/assets/img/2026-09-09-k6-modern-load-testing-en-1.png" alt="Cover image: modern load testing with k6, lightweight scripts and serious results" width="1200" height="333" />

Load testing has always been seen as an area "only for specialists": heavy tools, interfaces full of buttons, reports nobody knew how to interpret. But times have changed. Today, with microservices based architectures, public APIs and continuous deploys, knowing how your application behaves under pressure is no longer a luxury: it is part of the development cycle.

That is where **k6** (now **Grafana k6**) comes in: an open source load testing tool that treats tests as code, writes scenarios in JavaScript, and fits in a single binary, with no dependencies, no JVM and no IDE.

If you have used JMeter and felt you needed a course just to understand the interface, or tried Locust and found the Python ecosystem heavy for a quick test, k6 will surprise you.

> This article is a complete guide, from installation to advanced scenarios, with practical examples and references so you can dig deeper.

The core idea is simple: you write a script in JavaScript (or TypeScript), define how many virtual users will hit your application, and k6 runs the test producing reports with metrics such as response time, error rate and throughput.

## What is k6?

At its core, k6 is a command line tool that runs a script you write. There is no graphical interface and no project to set up: a single file is enough to describe the entire test.

What makes k6 special is its **architecture**: it is written in Go, and each virtual user runs as a goroutine, a lightweight concurrency mechanism. That means a single machine can simulate **thousands of simultaneous users** without consuming the resources that JMeter, for example, would need.

> **Official source:** [k6.io — Load testing for engineering teams](https://k6.io/)
>
> **GitHub repository:** [github.com/grafana/k6](https://github.com/grafana/k6), with more than 30 thousand stars

## What is k6 for? (Use cases)

k6 can be used in several situations, all of them related to understanding the limits of your application:

### API performance testing
The most common use. You simulate HTTP requests (GET, POST, PUT, DELETE) against your API endpoints and measure how they behave under load. k6 supports HTTP/1.1 and HTTP/2 natively.

### Stress and breakpoint testing
Want to know how far your application holds before it goes down? k6 lets you gradually increase the number of users until the system starts failing, the famous "breakpoint test".

### Spike testing
Simulate events such as Black Friday, a product launch or an email campaign that triggers thousands of simultaneous visits in seconds.

### Soak testing
Apply moderate load for hours (or days) to detect memory leaks, gradual performance degradation and problems that only show up with prolonged runtime.

### Testing in CI/CD pipelines
Integrate k6 directly into GitHub Actions, GitLab CI or any other pipeline. Define thresholds such as "p95 under 500ms" and the test fails automatically if the system does not meet the goal.

### WebSocket and gRPC testing
Beyond HTTP, k6 supports testing with WebSockets (persistent connections) and gRPC (modern RPC calls), two protocols that are increasingly common in reactive applications and microservices.

> **Official source:** [Grafana k6 — Testing guides](https://grafana.com/docs/k6/latest/testing-guides/)

## How to install k6

Installation is trivial on any system. k6 is a single binary, with no external dependencies.

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

After installing, confirm with `k6 version` in the terminal.

> **Official source:** [Grafana k6 — Install k6](https://grafana.com/docs/k6/latest/set-up/install-k6/)

## Your first load test

Let us start with something simple: a script that makes GET requests to a URL and measures the response time.

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

The code below is generated by the model. You do not need to write it.

```javascript
// Code generated by the model, not by you
import http from 'k6/http';
import { sleep, check } from 'k6';

export const options = {
  vus: 10,           // 10 simultaneous virtual users
  duration: '30s',   // for 30 seconds
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],    // less than 1% errors
  },
};

export default function () {
  const res = http.get('https://test-api.k6.io');

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

### How this works in practice

When you run `k6 run script.js`, k6:

1. Starts 10 simultaneous virtual users (VUs)
2. Each VU runs the `default` function in a loop
3. On every iteration, it makes a GET request and waits 1 second (simulating the "thinking time" of a real user)
4. At the end, it prints a complete report in the terminal

### Expected result

The report shows metrics such as:

- `http_req_duration`: total request time (average, median, p90, p95, p99)
- `http_req_failed`: the percentage of requests that failed
- `http_reqs`: requests per second, or throughput
- `vus`: the number of virtual users over time

```
    http_req_duration..............: avg=145ms   p(95)=320ms  p(99)=580ms
    http_req_failed...............: 0.00%
    http_reqs......................: 284   9.47/s
    vus............................: 10    min=10  max=10
```

## Thresholds: turning metrics into decisions

One of the most useful features of k6 are the **thresholds**: limits you define in the script itself. If the metric crosses the limit, k6 returns a non zero exit code, making the CI pipeline fail.

```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],
    http_req_failed: ['rate<0.01'],
    http_req_connecting: ['p(95)<100'],
  },
}
```

That means:
- 95% of requests must respond in under 500ms
- 99% in under 1000ms
- Less than 1% failure
- Connection time must stay under 100ms for 95% of cases

> **Official source:** [Grafana k6 — Thresholds](https://grafana.com/docs/k6/latest/using-k6/thresholds/)

## Scenarios and executors: simulating real traffic

k6 lets you configure **scenarios** with different **executors**, ways of increasing or decreasing load. You can simulate anything from a smooth growth in users to an abrupt spike.

### Ramping VUs

```javascript
export const options = {
  scenarios: {
    gradual_load: {
      executor: 'ramping-vus',
      stages: [
        { duration: '2m', target: 50 },   // ramp up to 50 users in 2 min
        { duration: '5m', target: 50 },   // hold for 5 min
        { duration: '2m', target: 100 },  // ramp up to 100
        { duration: '5m', target: 100 },  // hold
        { duration: '2m', target: 0 },    // ramp down
      ],
    },
  },
};
```

### Sudden spike

```javascript
export const options = {
  scenarios: {
    spike: {
      executor: 'ramping-vus',
      stages: [
        { duration: '10s', target: 5 },    // baseline
        { duration: '5s', target: 500 },   // SPIKE! 500 users in 5 seconds
        { duration: '30s', target: 500 },  // sustain
        { duration: '30s', target: 0 },    // recover
      ],
    },
  },
};
```

> **Official source:** [Grafana k6 — Scenarios](https://grafana.com/docs/k6/latest/using-k6/scenarios/)

### Load test types

The official k6 documentation defines six main test types:

| Type | Goal | Load profile |
|------|----------|-----------------|
| **Smoke test** | Verify the script works | 1 to 5 VUs, few iterations |
| **Average-load** | Behavior under typical traffic | Expected production load |
| **Stress** | Behavior above normal | 50 to 100% above average |
| **Spike** | Sudden traffic peaks | Abrupt rise, no plateau |
| **Breakpoint** | Find the breaking point | Continuous ramp until failure |
| **Soak** | Degradation over time | Average load for hours or days |

> **Official source:** [Grafana k6 — Test types](https://grafana.com/docs/k6/latest/testing-guides/test-types/)

## Beyond HTTP: WebSocket, gRPC and Browser

k6 is not only for REST APIs. It supports other protocols natively:

### WebSocket

```javascript
import ws from 'k6/ws';
import { check } from 'k6';

export default function () {
  const url = 'ws://localhost:8080/chat';
  const response = ws.connect(url, function (socket) {
    socket.on('open', () => console.log('connected'));
    socket.on('message', (data) => console.log('received:', data));
    socket.send('Hello server!');
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
    greeting: 'world',
  });
  check(response, {
    'status OK': (r) => r.status === grpc.StatusOK,
  });
  client.close();
}
```

### Browser testing (e2e)

With the `k6/browser` module, you can simulate real user interactions in the browser, with clicks, navigation and forms, while measuring frontend metrics such as First Contentful Paint (FCP) and Cumulative Layout Shift (CLS).

```javascript
import { browser } from 'k6/browser';

export default async function () {
  const page = await browser.newPage();
  await page.goto('https://test.k6.io');
  await page.locator('a[href="/my_messages.php"]').click();
  await page.close();
}
```

> **Official source:** [Grafana k6 — Using k6 browser](https://grafana.com/docs/k6/latest/using-k6-browser/)

## Metrics and observability

k6 generates metrics automatically for every test. The main ones are:

- `http_req_duration`: total duration (connection + TLS + sending + waiting + receiving)
- `http_req_failed`: proportion of requests that failed, whether from an error response or a timeout
- `http_reqs`: rate of requests per second
- `vus`: number of active virtual users
- `iteration_duration`: total time of each script iteration

You can create **custom metrics** to monitor specific aspects of your business:

```javascript
import { Counter } from 'k6/metrics';

const failedLogins = new Counter('failed_logins');

export default function () {
  const res = http.post('https://api.example.com/login', {
    user: 'test', password: 'wrong',
  });

  if (res.status !== 200) {
    failedLogins.add(1);
  }
}
```

Results can be exported to JSON, InfluxDB, Prometheus or directly to **Grafana Cloud**, a native integration that requires no extra configuration.

> **Official source:** [Grafana k6 — Metrics](https://grafana.com/docs/k6/latest/using-k6/metrics/)

## k6 versus other tools

How does k6 compare to the popular alternatives in 2026? Here is a summary based on recent technical analyses:

| Characteristic | k6 | JMeter | Gatling | Locust |
|---|---|---|---|---|
| **Language** | JavaScript/TypeScript | Java (GUI + XML) | Scala/Java/Kotlin | Python |
| **Concurrency model** | Goroutines (lightweight) | Thread per VU (heavy) | Async (Akka/Netty) | Greenlets (gevent) |
| **Native protocols** | HTTP, gRPC, WS, Browser | HTTP, JDBC, JMS, LDAP, FTP, SMTP | HTTP, WS, SSE | HTTP (extensible) |
| **CI/CD** | Excellent (native) | Average (requires setup) | Good | Good |
| **Performance per machine** | Very high | Average | High | High |
| **License** | AGPL-3.0 | Apache 2.0 | Apache 2.0 | MIT |

k6 stands out when:

- Your team already writes JavaScript
- You want to integrate load tests into the CI/CD pipeline
- You need high user density (thousands) on a single machine
- You value developer experience (versioned scripts, declarative thresholds)

JMeter is still a reference for protocols beyond HTTP (JDBC, JMS, LDAP) and for QA teams that prefer a graphical interface. Locust is the best choice if your team already works with Python and needs distributed testing with no cloud cost.

> **Sources:**
>
> - [QAInsights — JMeter vs k6 vs Locust in 2026](https://qainsights.com/jmeter-vs-k6-vs-locust-in-2026-which-load-testing-tool-should-you-pick/)
> - [Tech Insider — Load Testing Tools 2026: k6 vs JMeter vs Gatling](https://tech-insider.org/k6-vs-jmeter-vs-gatling-2026/)
> - [YoungJu.dev — Load Testing Tools 2026 — Deep Dive](https://www.youngju.dev/blog/culture/2026-05-14-load-testing-tools-2026-k6-locust-vegeta-gatling-artillery-jmeter-comparison-deep-dive.en)
> - [Ranorex — Load Testing Tools Compared](https://www.ranorex.com/blog/load-testing-tools/)

## k6 in practice: company examples

Organizations such as **Cloudflare**, **Citibank**, **Informatica**, **MIT** and many others use k6 in production. The most emblematic case is perhaps **Grafana Labs** itself, which offers **Grafana Cloud k6**, a SaaS platform for running tests at scale, with integrated dashboards and support for millions of geographically distributed virtual users.

With k6, it is possible to:

- Run smoke tests on every pull request (seconds)
- Run complete load tests on every merge to main (minutes)
- Schedule soak tests that last hours to detect degradation
- Correlate load metrics with logs and traces in the Grafana ecosystem

> **Source:** [Grafana k6 — OSS page](https://grafana.com/oss/k6/)

## Recommended videos

For those who prefer to learn visually:

1. **Grafana k6 for Beginners**: [Watch on YouTube](https://www.youtube.com/watch?v=1mtYVDA2_iQ), official Grafana playlist
2. **Introducing Grafana Cloud k6**: [Watch on YouTube](https://www.youtube.com/watch?v=HyM4lNZjKqk)
3. **Getting Started with API Load Testing** (Nick): practical demonstration with k6, covering stress, spike, load and soak tests

> All links were verified in the official Grafana sources and in relevant technical channels.

## Conclusion

k6 represents a paradigm shift in load testing. It is not just another tool: it is an approach that treats **performance as a software requirement**, with versioned, automated tests integrated into the development cycle.

If you work with APIs, microservices or web applications, and you still do not have load tests in your pipeline, k6 is probably the shortest path between "we do not test performance" and "our system holds up under pressure".

Start small: a 10 line script, one threshold, one commit. Then expand. What matters is to **start**.

### Useful links

- [Official k6 site](https://k6.io/)
- [Complete documentation](https://grafana.com/docs/k6/latest/)
- [GitHub repository](https://github.com/grafana/k6)
- [Grafana Cloud k6](https://grafana.com/products/cloud/k6/)
- [Community forum](https://community.grafana.com/)
- [Load testing guide with k6 (Flavio Copes)](https://flaviocopes.com/k6-load-testing-tutorial/)
- [k6 + CI/CD tutorial (QA Practices)](https://qapractices.com/documentation/k6-load-testing-tutorial/)
- [k6 + Grafana Cloud 2026 tutorial (QASkills.sh)](https://qaskills.sh/blog/k6-grafana-cloud-load-testing-tutorial-2026/)
- [Baeldung — How to Execute Load Tests Using k6](https://www.baeldung.com/k6-framework-load-testing)
