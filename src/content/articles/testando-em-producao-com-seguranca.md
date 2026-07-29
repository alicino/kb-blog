---
title: "Testando mudanças em produção com segurança"
description: "Feature flags, rollout gradual e observabilidade como alternativa a 'testar só em staging e torcer'."
publishDate: 2026-05-28
updatedDate: 2026-06-01
author: "Alicino"
category: "Engenharia"
tags: ["testes", "seguranca", "observabilidade"]
draft: false
---

Staging nunca é uma cópia perfeita de produção. Em algum momento, a mudança
precisa encontrar tráfego real — a questão é como fazer isso com o menor risco
possível.

## Feature flags como rede de segurança

Lançar uma mudança atrás de uma flag desligada por padrão permite reverter em
segundos, sem precisar de um novo deploy.

```ts
if (flags.isEnabled('novo-checkout', { userId })) {
  return renderNovoCheckout();
}
return renderCheckoutAtual();
```

## Rollout gradual em vez de tudo-ou-nada

Liberar para 1%, depois 10%, depois 50% do tráfego dá tempo de observar
métricas antes que um problema afete todo mundo.

| Etapa | Tráfego | O que observar |
| --- | --- | --- |
| Canário | 1% | Erros e latência |
| Expansão | 10–50% | Métricas de negócio |
| Completo | 100% | Estabilidade sustentada |

## Observabilidade é parte do teste, não um extra

Sem dashboards e alertas prontos antes do rollout, qualquer "sucesso" é só
sorte não confirmada. Definir o que observar é tão parte do teste quanto o
próprio código.

> Se ninguém está olhando os números, o rollout gradual é só um atraso do
> mesmo risco.

### Atualização

Depois de aplicar esse processo em duas migrações internas, o ponto que mais
economizou tempo foi ter um painel de rollback de um clique pronto **antes**
do primeiro rollout, não depois do primeiro incidente.
