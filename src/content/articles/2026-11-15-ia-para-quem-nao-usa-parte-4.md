---
title: "Quando a IA erra: como usar sem ser enganado"
description: "A IA não erra como um estagiário erra, ela erra com confiança. Veja os erros mais comuns, o dado que mostra a frequência e uma regra prática de conferência por consequência."
publishDate: 2026-11-15
author: "Alicino"
category: "Inteligência Artificial"
tags: ["IA para iniciantes", "inteligência artificial", "pensamento crítico", "verificação", "aprender IA"]
draft: false
---

<img src="/assets/img/2026-11-15-ia-para-quem-nao-usa-parte-4-1.png" alt="Capa sobre quando a IA erra: os erros mais comuns e como conferir por consequência" width="1200" height="333" />

A IA não erra como um estagiário erra. O estagiário hesita, pergunta, pede desculpa. A IA escreve errado com a mesma confiança com que escreve certo, e é isso que a torna perigosa.

Este é o quarto post da [série](/artigos/2026-11-11-ia-para-quem-nao-usa-parte-1/). No [post anterior](/artigos/2026-11-13-ia-para-quem-nao-usa-parte-3/), a conclusão foi que a IA **aumenta** o trabalho humano em vez de substituí-lo. Só que ela só aumenta se você conferir.

## Por que o erro é difícil de perceber

Existem três razões, e nenhuma delas depende de você ser descuidado.

**Não existe mensagem de erro.** Não existe "não tenho certeza", não existe asterisco, não existe tom de dúvida. A frase falsa tem a mesma gramática e o mesmo tom da frase verdadeira.

**O erro aparece no meio de um texto bom.** Um parágrafo impecável, bem escrito, com um número inventado no meio.

**Ela foi treinada para soar útil.** Este ponto tem pesquisa por trás, e vale entender. Um estudo da OpenAI com o Georgia Tech, publicado em setembro de 2025, chamado [*Why Language Models Hallucinate*](https://arxiv.org/html/2509.04664), argumenta que os modelos alucinam porque **o treinamento e a avaliação recompensam o chute em vez de admitir incerteza**.

A comparação que os autores usam é direta: é como um aluno diante de uma questão difícil, que arrisca um palpite em vez de escrever "não sei". A diferença é que, numa prova, chutar às vezes acerta. E como a maioria dos testes pontua resposta errada igual a resposta em branco, o palpite sai mais barato do que a honestidade. Treinado nessa régua, o modelo aprende a preferir soar seguro.

## O erro não é raro

Vale saber que isso não é um detalhe de modelos antigos, nem uma fase que já passou.

Um estudo publicado na *Journal of Medical Internet Research* pediu a dois modelos que produzissem **84 revisões de literatura** curtas, cobrindo 42 temas, e depois conferiu cada uma das **636 referências** citadas, procurando em bases de dados se os trabalhos existiam de verdade.

O resultado: **55% das citações do GPT-3.5 eram inventadas**. Não era um link errado. Era um artigo que não existe, com autor, revista e ano plausíveis. No GPT-4, o número caiu para **18%**, uma melhora grande e ainda assim quase uma em cada cinco referências.

O mesmo estudo achou outra camada de problema: entre as citações que **eram reais**, 43% no GPT-3.5 e 24% no GPT-4 continham algum erro relevante, seja o autor trocado, seja o ano, seja a revista.

Vale reparar no que isso significa na prática. Uma referência inventada é fácil de detectar, porque a busca volta vazia. Uma referência **real citada errado** é bem mais difícil, porque a fonte existe e parece conferir o que está sendo dito.

## Os cinco erros mais comuns

**1. Inventar fonte.** Cita um artigo, uma norma ou um estudo que não existe, ou que existe e não diz aquilo. É o erro com maior taxa de ocorrência nos testes, e o mais fácil de pegar em 30 segundos.

**2. Trocar o autor da ideia.** Atribui um conceito a quem não formulou. O texto fica correto sobre o assunto e errado sobre a história.

**3. Misturar conceitos parecidos.** Junta dois termos que se confundem e produz uma definição que não é de nenhum dos dois. É o erro mais difícil de perceber, porque exige que você já conheça a fronteira entre os dois conceitos.

**4. Inventar número.** Uma estatística plausível, sem origem verificável. Costuma vir acompanhada de um "segundo estudos" que nunca é nomeado.

**5. Informação com data de corte.** O conhecimento tem uma data-limite, e a data-limite não é uma linha nítida. Uma pesquisa da Johns Hopkins com a Allen Institute for AI chamada [*Dated Data: Tracing Knowledge Cutoffs in Large Language Models*](https://arxiv.org/abs/2403.12958) mostrou que o corte **efetivo** varia conforme o assunto, e costuma ser bem mais antigo que o corte divulgado. Ou seja: a ferramenta pode descrever com segurança uma versão que mudou há mais de um ano.

## A regra por consequência

Não confira tudo, porque conferir tudo mata o ganho que justifica usar a ferramenta. Confira por **consequência**:

1. **Rascunho interno, para você mesmo.** Pode sair direto. Se estiver errado, você percebe e corrige.
2. **Texto que vai para outra pessoa.** Releia com atenção. Ninguém vai saber que a IA escreveu: vão achar que foi você.
3. **Texto que vai para cliente, ou decisão que envolve dinheiro.** Confira cada fato, número e nome.
4. **Dado que vai para um sistema, ou informação que vira registro.** Confira duas vezes, ou não use IA para isso.

O ponto da regra é o seguinte: o mesmo texto pode exigir conferência zero ou conferência total, dependendo de onde ele vai parar. O erro comum é aplicar a mesma régua para os dois casos, e é aí que acontece o acidente.

## Como conferir em 30 segundos sem virar especialista

Três perguntas, nesta ordem:

**Tem fonte?** Se a IA afirmou um fato, ela citou de onde veio? Se não citou, trate como não verificado. Não importa o quanto soou seguro.

**A fonte diz aquilo?** Se citou, abra. Não é desconfiança, é o mesmo que você faz com qualquer fonte secundária em qualquer contexto.

**Faz sentido com o que eu sei?** Se o número parece alto ou baixo demais, desconfie. Conhecimento do negócio é o detector de erro mais barato que existe, e você já tem ele.

## O que fazer quando você não tem como conferir

Aqui está a decisão honesta: se você não consegue verificar uma afirmação e ela vai virar decisão, **não use**.

Não é preguiça de conferir, é ausência de base.

E o inverso também vale. Se você não entende o assunto o suficiente para perceber um erro, a IA não te ajuda, ela te dá uma falsa sensação de competência. É o risco que o post anterior chamou de usar a IA para fazer o trabalho, em vez de usar para fazer melhor o trabalho.

## Registrar o que você conferiu

Detalhe pequeno, efeito grande: quando você confere algo e confirma, **anote**.

Uma linha basta, algo como "conferido na fonte X em 01/11". Seis meses depois, você ou um colega não vai refazer a conferência, e também não vai confiar sem base.

## Fechamento

Usar IA sem conferir não é confiança, é fé. E fé não é um bom método de trabalho, principalmente quando o texto sai com o seu nome.

A IA é excelente para produzir a primeira versão e péssima para garantir que ela está certa. Essas duas coisas são trabalhos diferentes, e o segundo continua sendo seu.

O último post da série trata de uma preocupação que quase todo mundo tem e quase ninguém pergunta em voz alta: para onde vai o que você cola ali dentro?

## Fontes e links

- [*Why Language Models Hallucinate*](https://arxiv.org/html/2509.04664), de Adam Tauman Kalai, Ofir Nachum, Santosh S. Vempala e Edwin Zhang (OpenAI e Georgia Tech, setembro de 2025), sobre por que o treinamento e a avaliação recompensam o palpite em vez da incerteza
- [*Fabrication and errors in the bibliographic citations generated by ChatGPT*](https://pmc.ncbi.nlm.nih.gov/articles/PMC10484980/), na *Journal of Medical Internet Research*, o estudo que mediu 636 referências: 55% de citações inventadas no GPT-3.5 e 18% no GPT-4
- [*Dated Data: Tracing Knowledge Cutoffs in Large Language Models*](https://arxiv.org/abs/2403.12958), de Jeffrey Cheng e outros (Johns Hopkins e Allen Institute for AI), sobre por que o corte efetivo de conhecimento varia por assunto
