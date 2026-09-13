---
title: "Modern Load Testing with k6: Lightweight Scripts, Serious Results"
description: "Discover k6, Grafana's open source load testing tool that uses JavaScript, integrates with CI/CD, and monitors performance with granular metrics."
publishDate: 2026-09-09
author: "Alicino"
category: "Ferramentas"
tags: ["k6", "load-testing", "performance", "grafana", "devops", "javascript"]
draft: false
---

Load testing has always felt like something only specialists do. Heavy tools, interfaces full of buttons you don't understand, reports that make no sense. But things have changed. When you're running microservices, exposing public APIs, and deploying continuously, knowing how your application behaves under load isn't optional anymore. It's part of the job.

That's where k6 comes in. Now called Grafana k6, it's an open source load testing tool that treats tests like code, writes scenarios in JavaScript, and fits in a single binary. No dependencies, no JVM, no IDE needed.

If you've used JMeter and felt like you needed a semester of training just to understand the UI, or tried Locust and found Python too heavy for a quick test, k6 will feel refreshing.

## What is k6

k6 is a load testing tool created by the k6 company (which Grafana Labs bought in 2021) and has been open source since 2016.

The core idea is straightforward: you write a script in JavaScript or TypeScript, tell it how many virtual users should hit your application, and k6 runs the test and generates reports. Response times, error rates, throughput. All the metrics that matter.

The real power is in the simplicity. Your tests are code. They live in git. They run in your CI/CD pipeline just like your unit tests. A load test that used to take an hour to set up now takes 15 minutes.

## k6 versus the alternatives

| What | k6 | JMeter | Locust |
|---|---|---|---|
| You write it in | JavaScript/Go | Point and click | Python |
| How long to learn | 30 minutes | 2 weeks | 1 week |
| Works in CI/CD | Yes, natively | Awkward | Possible |
| Custom logic | Easy | Hard | Medium |
| Single executable | Yes | Nope, needs Java | Nope, needs Python |
| Cloud testing | Yes via k6 Cloud | Need third party | Need third party |

## Install it

k6 runs on Windows, macOS, and Linux. Installation is fast:

```bash
# macOS
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6-stable.list
sudo apt-get update && sudo apt-get install k6

# Windows
choco install k6

# Or grab it directly from https://github.com/grafana/k6/releases
```

Verify it works:

```bash
k6 version
```

## Your first test in 5 minutes

Here's a minimal test that hits a website 10 times with 5 concurrent users over 30 seconds:

```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '10s', target: 5 },
    { duration: '20s', target: 5 },
    { duration: '10s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<200'],
  },
};

export default function () {
  const res = http.get('https://example.com');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time under 200ms': (r) => r.timings.duration < 200,
  });
  sleep(1);
}
```

Run it:

```bash
k6 run test.js
```

What just happened: the test ramped up to 5 users over 10 seconds, kept them for 20 seconds, then ramped down. Each request checked the status code and response time. If 95% of requests beat 200ms, the test passed.

The output shows you the essentials:

```
checks............... 100.00% ✓
data_received........ 12 MB
data_sent............ 2.3 MB
http_reqs............ 50
http_req_duration... avg=45ms   p(95)=89ms    p(99)=120ms
http_req_failed..... 0.00%
iterations.......... 50
vus................. 0
vus_max............. 5
```

## A more realistic example with authentication

Now something closer to what you'd actually test. A REST API that needs authentication:

```javascript
import http from 'k6/http';
import { check, sleep, group } from 'k6';
import encoding from 'k6/encoding';

export const options = {
  stages: [
    { duration: '30s', target: 10 },
    { duration: '1m30s', target: 10 },
    { duration: '20s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(99)<500', 'p(95)<250'],
    http_req_failed: ['rate<0.1'],
  },
};

export default function () {
  group('authentication', () => {
    const payload = JSON.stringify({
      email: 'user@example.com',
      password: 'pass123',
    });
    const res = http.post('https://api.example.com/auth/login', payload, {
      headers: { 'Content-Type': 'application/json' },
    });
    check(res, {
      'login works': (r) => r.status === 200,
      'got a token': (r) => r.json('token') !== '',
    });

    const token = res.json('token');
    
    group('fetch users', () => {
      const res = http.get('https://api.example.com/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      check(res, {
        'user list loads': (r) => r.status === 200,
        'has users': (r) => r.json('data').length > 0,
      });
    });

    group('create new user', () => {
      const newUser = {
        name: `User ${Math.random()}`,
        email: `user${Math.random()}@example.com`,
      };
      const res = http.post('https://api.example.com/users', JSON.stringify(newUser), {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });
      check(res, {
        'user created': (r) => r.status === 201,
        'has new id': (r) => r.json('id') !== null,
      });
    });
  });

  sleep(1);
}
```

## The concepts that matter

**Stages.** You define ramp-up, sustain, and ramp-down phases:

```javascript
stages: [
  { duration: '1m', target: 10 },   // Build up to 10 users
  { duration: '3m', target: 10 },   // Hold at 10
  { duration: '1m', target: 0 },    // Drop to zero
]
```

**Checks.** Assertions that don't fail the test if they're wrong, just report the result:

```javascript
check(res, {
  'got 200': (r) => r.status === 200,
  'body is big enough': (r) => r.body.length > 100,
});
```

If a check fails, the test keeps going. Use `throw` if you want to actually fail the test:

```javascript
if (res.status !== 200) throw new Error('Bad status');
```

**Thresholds.** These actually fail the test:

```javascript
thresholds: {
  http_req_duration: ['p(95)<200', 'p(99)<500'],
  http_req_failed: ['rate<0.05'],
}
```

This fails if 95% of requests exceed 200ms, or if 99% exceed 500ms, or if failure rate goes above 5%.

**Groups.** Organize related requests and get metrics grouped:

```javascript
group('login flow', () => {
  // Multiple requests here
});

group('user operations', () => {
  // Other requests
});
```

Each group gets its own metrics in the report.

## Running in CI/CD

Here's a GitHub Actions workflow to run k6 on every push:

```yaml
name: Load Test

on: [push]

jobs:
  k6_load_test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Run k6 test
        uses: grafana/k6-action@v0.3.1
        with:
          filename: tests/load.js
          cloud: true
          token: ${{ secrets.K6_CLOUD_TOKEN }}
```

Results get uploaded to k6 Cloud where you see trends over time.

## Common patterns you'll actually use

**Data-driven tests.** Use different data from a CSV file:

```javascript
import { SharedArray } from 'k6/data';
import papaparse from 'https://jslib.k6.io/papaparse/5.1.1/index.js';
import http from 'k6/http';

const data = new SharedArray('data', () => {
  const f = open('../data/users.csv');
  return papaparse.parse(f, { header: true }).data;
});

export default function () {
  const user = data[Math.floor(Math.random() * data.length)];
  http.post('https://api.example.com/login', {
    email: user.email,
    password: user.password,
  });
}
```

**Backoff patterns.** Simulate real user behavior:

```javascript
export default function () {
  if (__VU > 50) {
    sleep(Math.random() * 5);  // Busier users wait more
  }

  http.get('https://api.example.com/resource');
}
```

**Custom business metrics.** Track what actually matters:

```javascript
import { Trend, Rate } from 'k6/metrics';

const loginTime = new Trend('login_time');
const paymentSuccess = new Rate('payment_success');

export default function () {
  const start = Date.now();
  const res = http.post('https://api.example.com/auth/login', {...});
  loginTime.add(Date.now() - start);

  const paymentRes = http.post('https://api.example.com/payment', {...});
  paymentSuccess.add(paymentRes.status === 200);
}
```

## Best practices that actually work

Start small and scale up gradually. Use stages. Define clear thresholds before you run. Test from multiple locations if you can. Most importantly, watch the system you're testing while the load test runs. Watch CPU, memory, database queries. All of it.

Treat load tests like production code. Version control them. Document assumptions. Run them regularly so you catch performance regressions before they hit production.

## Where to go from here

Read the docs at k6.io/docs. Try k6 Cloud at cloud.k6.io if you want to run distributed tests. Check out the community forum at community.k6.io.

## The bottom line

k6 removes the barrier to entry for load testing. If you've been putting it off because traditional tools seemed too heavy, try k6. You'll have a realistic load test running in under an hour. Add it to CI/CD and never ship a performance regression again.
