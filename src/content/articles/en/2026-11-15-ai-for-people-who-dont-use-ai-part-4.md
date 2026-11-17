---
title: "When AI gets it wrong: how to use it without being fooled"
description: "AI does not make mistakes the way an intern does, it makes them confidently. Here are the most common errors, the data showing how often they happen, and a practical rule for checking by consequence."
publishDate: 2026-11-15
author: "Alicino"
category: "Inteligência Artificial"
tags: ["AI for beginners", "artificial intelligence", "critical thinking", "verification", "learning AI"]
draft: false
---

<img src="/assets/img/2026-11-15-ia-para-quem-nao-usa-parte-4-en-1.png" alt="Cover about when AI gets things wrong: the most common errors and how to check by consequence" width="1200" height="333" />

AI does not make mistakes the way an intern does. An intern hesitates, asks, apologizes. AI writes something wrong with the same confidence it uses to write something right, and that is what makes it dangerous.

This is the fourth post in the [series](/en/articles/2026-11-11-ai-for-people-who-dont-use-ai-part-1/). In the [previous post](/en/articles/2026-11-13-ai-for-people-who-dont-use-ai-part-3/), the conclusion was that AI **increases** human work instead of replacing it. But it only increases it if you check.

## Why the error is hard to notice

There are three reasons, and none of them depend on you being careless.

**There is no error message.** There is no "I am not sure", no asterisk, no tone of doubt. The false sentence has the same grammar and the same tone as the true one.

**The error shows up inside a good text.** An impeccable paragraph, well written, with an invented number in the middle.

**It was trained to sound useful.** This point has research behind it, and it is worth understanding. A study from OpenAI with Georgia Tech, published in September 2025, called [*Why Language Models Hallucinate*](https://arxiv.org/html/2509.04664), argues that models hallucinate because **training and evaluation reward guessing instead of admitting uncertainty**.

The comparison the authors use is direct: it is like a student facing a hard question, who risks a guess instead of writing "I don't know". The difference is that, on a test, guessing sometimes pays off. And since most tests score a wrong answer the same as a blank one, the guess costs less than honesty. Trained on that standard, the model learns to prefer sounding certain.

## The error is not rare

It is worth knowing this is not a detail of older models, nor a phase that has passed.

A study published in the *Journal of Medical Internet Research* asked two models to produce **84 short literature reviews**, covering 42 topics, then checked every one of the **636 references** cited, searching databases to see whether the works really existed.

The result: **55% of GPT-3.5's citations were fabricated**. Not a wrong link. An article that does not exist, with a plausible author, journal and year. In GPT-4 the number dropped to **18%**, a large improvement and still nearly one in five references.

The same study found another layer of the problem: among the citations that **were real**, 43% in GPT-3.5 and 24% in GPT-4 contained some relevant error, whether a swapped author, a wrong year or a wrong journal.

Notice what that means in practice. A fabricated reference is easy to catch, because the search comes back empty. A **real reference cited wrongly** is much harder, because the source exists and appears to support what is being said.

## The five most common errors

**1. Inventing a source.** It cites an article, a standard or a study that does not exist, or that exists and does not say that. It is the error with the highest rate in the tests, and the easiest to catch in 30 seconds.

**2. Swapping the author of an idea.** It attributes a concept to someone who did not formulate it. The text stays correct about the subject and wrong about the history.

**3. Mixing up similar concepts.** It joins two terms that get confused and produces a definition that belongs to neither. It is the hardest error to notice, because it requires that you already know the boundary between the two concepts.

**4. Inventing a number.** A plausible statistic, with no verifiable origin. It usually arrives attached to a "studies show" that is never named.

**5. Information past its cutoff.** Knowledge has a cutoff date, and the cutoff date is not a clean line. Research from Johns Hopkins with the Allen Institute for AI called [*Dated Data: Tracing Knowledge Cutoffs in Large Language Models*](https://arxiv.org/abs/2403.12958) showed that the **effective** cutoff varies by subject, and is usually much older than the announced one. In other words: the tool can confidently describe a version that changed more than a year ago.

## The rule by consequence

Do not check everything, because checking everything kills the gain that justifies using the tool. Check by **consequence**:

1. **An internal draft, for yourself.** It can go out as is. If it is wrong, you notice and fix it.
2. **Text going to another person.** Read it carefully. Nobody will know AI wrote it: they will think you did.
3. **Text going to a client, or a decision involving money.** Check every fact, number and name.
4. **Data going into a system, or information that becomes a record.** Check twice, or do not use AI for it.

The point of the rule is this: the same text can require zero checking or total checking, depending on where it ends up. The common mistake is applying the same standard to both cases, and that is where the accident happens.

## How to check in 30 seconds without becoming an expert

Three questions, in this order:

**Is there a source?** If AI stated a fact, did it say where it came from? If it did not, treat it as unverified. It does not matter how certain it sounded.

**Does the source say that?** If it cited one, open it. This is not distrust, it is what you do with any secondary source in any context.

**Does it make sense given what I know?** If the number seems too high or too low, distrust it. Business knowledge is the cheapest error detector there is, and you already have it.

## What to do when you cannot check

Here is the honest decision: if you cannot verify a claim and it is going to become a decision, **do not use it**.

It is not laziness about checking, it is a lack of basis.

And the reverse also holds. If you do not understand the subject well enough to notice an error, AI does not help you, it gives you a false sense of competence. That is the risk the previous post called using AI to do the work, instead of using it to do the work better.

## Recording what you checked

A small detail with a large effect: when you check something and confirm it, **write it down**.

One line is enough, something like "checked against source X on 11/01". Six months later, you or a colleague will not redo the check, and will not trust it without a basis either.

## Closing

Using AI without checking is not confidence, it is faith. And faith is not a good method for work, especially when the text goes out with your name on it.

AI is excellent at producing the first version and terrible at guaranteeing it is right. Those are two different jobs, and the second one is still yours.

The last post in the series deals with a concern almost everyone has and almost nobody asks out loud: where does what you paste in there actually go?

## Sources and links

- [*Why Language Models Hallucinate*](https://arxiv.org/html/2509.04664), by Adam Tauman Kalai, Ofir Nachum, Santosh S. Vempala and Edwin Zhang (OpenAI and Georgia Tech, September 2025), on why training and evaluation reward guessing over uncertainty
- [*Fabrication and errors in the bibliographic citations generated by ChatGPT*](https://pmc.ncbi.nlm.nih.gov/articles/PMC10484980/), in the *Journal of Medical Internet Research*, the study that measured 636 references: 55% fabricated citations in GPT-3.5 and 18% in GPT-4
- [*Dated Data: Tracing Knowledge Cutoffs in Large Language Models*](https://arxiv.org/abs/2403.12958), by Jeffrey Cheng and others (Johns Hopkins and Allen Institute for AI), on why the effective knowledge cutoff varies by subject
