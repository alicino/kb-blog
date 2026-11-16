---
title: "Usar IA sem entregar seus dados: o mínimo que todo mundo deveria saber"
description: "Para onde vai o que você cola num chat de IA? Veja o que os próprios provedores dizem, a lista do que nunca colar, o que fazer quando a empresa não tem política e como não ficar refém de uma ferramenta só."
publishDate: 2026-11-17
author: "Alicino"
category: "Inteligência Artificial"
tags: ["IA para iniciantes", "privacidade", "inteligência artificial", "segurança", "dados"]
draft: false
---

<img src="/assets/img/2026-11-17-ia-para-quem-nao-usa-parte-5-1.png" alt="Capa sobre usar IA sem entregar seus dados: o que nunca colar e como não ficar refém de uma ferramenta" width="1200" height="333" />

Existe uma pergunta que quase ninguém faz em voz alta na reunião: **se eu colar isso aqui, para onde vai?**

Este é o último post da [série](/artigos/2026-11-11-ia-para-quem-nao-usa-parte-1/). Nos quatro anteriores falamos de reconhecer uma tarefa que vale a pena, transformar em processo, entender onde está o seu risco e conferir o resultado. Ficou faltando a preocupação silenciosa, aquela que a maioria tem e não pergunta.

Não é sobre criptografia nem segurança avançada. É sobre o que não colocar na caixa de texto, e como não ficar dependente de uma ferramenta só.

## Para onde vai o texto que você cola

Quando você cola um trecho num chat de IA, aquele texto sai do seu computador e vai para o servidor de outra empresa. Isso não é teoria. Está escrito nos termos de uso, e os próprios provedores publicam o que fazem com o dado.

As maiores empresas de IA hoje dizem coisas parecidas. Vale conhecer esse vocabulário, porque ele se repete:

1. **Não treinam com o seu dado por padrão**, nas ofertas corporativas e na API. A OpenAI afirma isso de forma explícita para os produtos de empresa e para a plataforma de API.
2. **Retenção limitada.** Na API, a retenção dos textos de entrada e saída é de até 30 dias, para operação e detecção de abuso, e depois são removidos dos sistemas.
3. **Retenção zero, sob pedido.** Existe uma opção de retenção zero de dados para casos elegíveis, disponível mediante solicitação.
4. **Criptografia em trânsito e em repouso**, com auditoria de segurança independente.

Tudo isso é tranquilizador. E nenhum desses itens responde à pergunta que importa. Eles descrevem **o que a empresa faz com o dado**. Não dizem nada sobre **se aquele dado podia sair da sua empresa em primeiro lugar**.

São duas perguntas diferentes, e é por isso que a segunda costuma ser ignorada. A primeira tem resposta no site do fornecedor. A segunda depende de você.

### O que aconteceu quando isso deu errado

Em 2023, a Samsung descobriu que funcionários tinham colado **código-fonte interno** em um chat público de IA. A resposta foi rígida. A empresa proibiu o uso de ferramentas generativas nas redes internas e nos aparelhos da companhia. No aviso aos funcionários, a violação podia levar a **demissão por justa causa**.

O episódio ficou famoso porque foi grande, e é útil porque mostra o mecanismo. Não houve ataque, invasão nem falha de segurança. Houve pessoas fazendo o que parecia razoável, com a ferramenta aberta na tela, por hábito.

Um detalhe desse caso merece atenção. O que a Samsung perdia não era só o vazamento. Era **a capacidade de apagar depois**. Dado que saiu para o servidor de outra empresa deixa de estar sob o seu controle, e a empresa não tem mais como garantir que ele desapareceu.

## A lista do nunca colar

1. Nome, documento, telefone ou endereço de cliente
2. Dado de colega: avaliação, salário, situação pessoal ou de saúde
3. Contrato, proposta com preço, condição comercial negociada
4. Credencial: senha, chave de acesso, token de API
5. Código ou documento proprietário da empresa
6. Qualquer coisa marcada como confidencial, ou que você não mostraria para alguém de fora

**A regra de bolso:** se você não colaria isso num grupo de WhatsApp com gente da empresa, não cole num chat de IA.

Essa regra funciona porque não exige que você entenda de segurança. Ela usa um critério que todo mundo já aplica de forma intuitiva no dia a dia.

Vale dizer que a lista vale para dado **pessoal**, e no Brasil e na Europa isso tem definição jurídica. Dado pessoal é qualquer informação ligada a uma pessoa identificada ou identificável, e ele tem proteção legal própria. Colar a avaliação de desempenho de um colega num chat de IA não é só uma questão de bom senso. É tratamento de dado pessoal por uma via que a empresa não autorizou.

## O que fazer quando a política da empresa não diz nada

A maioria das empresas não tem política sobre isso. Isso não é permissão. É ausência de regra, e as duas coisas se parecem até o dia em que algo dá errado.

**Pergunte antes, não depois.** Uma pergunta ao gestor ou ao time de segurança custa cinco minutos. Descobrir depois que você expôs dado de cliente custa bem mais, e não custa só para a empresa.

**Na dúvida, anonimize.** Troque o nome do cliente por "Cliente A", o valor por "valor X", o endereço por "endereço Y". Na maioria das tarefas, escrever, resumir, organizar, reescrever, o dado real não faz diferença nenhuma no resultado. Você obtém a mesma ajuda sem entregar nada.

**Se a empresa tem ferramenta aprovada, use ela.** A diferença entre a ferramenta aprovada e a sua conta pessoal é exatamente o que acontece com o dado depois. Na ferramenta da casa existe contrato, responsabilidade definida e alguém que responde pelo tratamento. Na sua conta pessoal, quem responde é você.

## IA aprovada versus IA pessoal

**Ferramenta da empresa:** o dado fica sob a política dela, com contrato, retenção definida e responsabilidade clara sobre o que pode ou não acontecer.

**Sua conta pessoal:** o dado sai sob os seus termos de uso pessoais, no seu nome, e a empresa não tem controle nem visibilidade nenhuma sobre ele.

Misturar as duas é o erro mais comum e o mais fácil de evitar. A regra: **assunto de trabalho, ferramenta de trabalho. Assunto pessoal, ferramenta pessoal.** Nunca cruze.

O motivo de a regra ser tão categórica é que a mistura raramente é uma decisão. Ela acontece por conveniência: o chat pessoal já está aberto, o login da empresa está no outro navegador, e a tarefa é pequena. É assim que a fronteira desaparece, um atalho por vez.

## Não seja refém de uma ferramenta só

Esta é a parte que quase ninguém pensa, e vale para qualquer ferramenta, não só IA.

**Guarde o que é seu em formato que você consegue levar embora.** Texto simples, arquivo que abre em qualquer programa. Se amanhã a ferramenta mudar de preço, fechar ou piorar, o seu trabalho continua com você.

**Não construa processo que só funciona numa ferramenta.** Se o seu processo de ata depende de um aplicativo específico, ele está preso a esse aplicativo. A pergunta que revela o problema é simples: se essa ferramenta sumir amanhã, você consegue fazer a mesma coisa em outro lugar? Se responder não, você tem uma dependência, e não uma escolha.

**Teste uma vez por ano:** consiga exportar tudo e abrir num programa comum. Se não conseguir, você não é dono do seu material.

Essa ideia é tão razoável que virou lei em alguns lugares. O regulamento europeu de proteção de dados garante o **direito à portabilidade** dos dados pessoais. Você pode pedir seus dados em formato estruturado, de uso comum e legível por máquina, e levá-los para outro serviço. A lógica vale para qualquer ferramenta que guarde o seu trabalho, mesmo quando a lei não se aplica diretamente.

## Como se manter atualizado sem enlouquecer

O assunto muda toda semana e não dá para acompanhar tudo. Não tente.

**Duas fontes boas, não vinte.** Uma oficial, que é a documentação da ferramenta que você usa, e uma de confiança para entender o contexto. Duas bem escolhidas cobrem mais do que vinte lidas por cima.

**Ignore lançamento.** A ferramenta nova que promete tudo raramente muda o seu dia. O que muda o seu dia é você dominar uma coisa só. A novidade que importa chega até você de qualquer forma, pelas duas fontes que você escolheu.

**Aprenda quando doer.** Quando a sua tarefa travar por falta de conhecimento, aí você estuda aquilo. Antes disso, é consumo de conteúdo disfarçado de estudo.

## O que a série inteira quis dizer

Cinco posts, uma ideia só: **a IA não substitui o seu julgamento, ela amplifica o que você já tem.**

Se você tem clareza sobre o seu trabalho, ela devolve tempo. Se você não tem, ela produz volume, e volume sem direção é só mais trabalho para revisar. Esse é o risco real, e ele não vem de errar uma pergunta. Vem de usar a ferramenta para parecer produtivo em vez de ser.

O caminho que propusemos:

1. [Reconheça uma tarefa que vale a pena](/artigos/2026-11-11-ia-para-quem-nao-usa-parte-1/)
2. [Transforme em processo e repita](/artigos/2026-11-12-ia-para-quem-nao-usa-parte-2/)
3. [Entenda onde está o seu risco real](/artigos/2026-11-13-ia-para-quem-nao-usa-parte-3/), que não é igual para todo mundo
4. [Confira, porque ela erra com confiança](/artigos/2026-11-15-ia-para-quem-nao-usa-parte-4/)
5. Proteja o que é seu e não fique preso a uma ferramenta só

Nenhum dos cinco exige saber programar, pagar assinatura ou virar especialista. Exige só uma decisão: usar a ferramenta para fazer melhor o trabalho que já é seu, e não para parecer produtivo enquanto o trabalho de verdade espera.

## Fontes e links

1. [Enterprise privacy at OpenAI](https://platform.openai.com/docs/guides/your-data), sobre a retenção de até 30 dias na API, a opção de retenção zero, a criptografia em trânsito e em repouso e a auditoria de segurança
2. [AI, Large Language Models and Data Protection](https://www.dataprotection.ie/en/dpc-guidance/blogs/AI-LLMs-and-Data-Protection), da Comissão de Proteção de Dados da Irlanda (julho de 2024), sobre tratamento de dado pessoal no uso de modelos de linguagem
3. [Samsung bans ChatGPT and other generative AI use by staff after leak](https://www.theverge.com/2023/5/2/23707796/samsung-ban-chatgpt-generative-ai-bing-bard-employees-security-concerns), do *The Verge* (maio de 2023), sobre o vazamento de código interno e a proibição que se seguiu
4. [LLM02: Sensitive Information Disclosure](https://genai.owasp.org/llmrisk/llm022025-sensitive-information-disclosure/), do OWASP Top 10 para aplicações de IA, sobre o risco de exposição de informação sensível, incluindo dado pessoal e credencial
5. [Artigo 20 da GDPR: direito à portabilidade dos dados](https://gdpr-info.eu/art-20-gdpr/), o texto do regulamento europeu sobre receber seus dados em formato estruturado e de uso comum
