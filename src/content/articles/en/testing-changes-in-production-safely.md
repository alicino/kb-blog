---
title: "Testing changes in production safely"
description: "Feature flags, gradual rollout, and observability as an alternative to 'only testing in staging and crossing your fingers'."
publishDate: 2026-05-28
updatedDate: 2026-06-01
author: "Alicino"
category: "Engenharia"
tags: ["testing", "security", "observability"]
draft: false
---

Staging is never a perfect copy of production. At some point, the change needs
to meet real traffic. The question is how to do that with the least risk
possible.

## Feature flags as a safety net

Launching a change behind a flag that is off by default lets you roll back in
seconds, without needing a new deploy.

```ts
if (flags.isEnabled('novo-checkout', { userId })) {
  return renderNovoCheckout();
}
return renderCheckoutAtual();
```

## Gradual rollout instead of all or nothing

Releasing to 1%, then 10%, then 50% of traffic gives you time to observe
metrics before a problem affects everyone.

| Stage | Traffic | What to observe |
| --- | --- | --- |
| Canary | 1% | Errors and latency |
| Expansion | 10-50% | Business metrics |
| Full | 100% | Sustained stability |

## Observability is part of the test, not an extra

Without dashboards and alerts ready before the rollout, any "success" is just
unconfirmed luck. Defining what to observe is as much a part of the test as the
code itself.

> If nobody is watching the numbers, the gradual rollout is just a delay of the
> same risk.

### Update

After applying this process to two internal migrations, the point that saved
the most time was having a one-click rollback dashboard ready **before** the
first rollout, not after the first incident.
