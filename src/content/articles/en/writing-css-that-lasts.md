---
title: "Writing CSS That Still Makes Sense a Year From Now"
description: "How to write CSS that ages well: cascade layers, registered variables, names that describe function, and a method for deleting dead code without fear."
publishDate: 2026-07-15
author: "Alicino"
category: "Design"
tags: ["css", "design-system", "maintainability", "cascade"]
draft: false
coverAlt: "Illustration of overlapping style layers"
---

<img src="/assets/img/writing-css-that-lasts-en-1.png" alt="Cover about writing CSS that lasts: design tokens, layers and rules that age well" width="1200" height="333" />

CSS does not go bad all at once. It gets worse one `!important` at a time, until nobody knows anymore what can be deleted without breaking some page you never tested.

The symptom that gives that state away is always the same: you need to **change** the layout and you cannot predict the result. You tweak a border radius, a color shifts on another page, spacing collapses in a distant component. So you protect the change with more specificity, and the problem grows.

This article is about the opposite of that. The goal is that, a year from now, you can open the file, understand what each rule does, and delete what is left over, with confidence.

## What you will learn

- What the cascade decides before specificity, and why `@layer` solves the problem that `!important` only pushes forward
- How to declare variables that defend themselves, instead of turning into disguised magic values
- Why naming by what an element *is* ages better than naming by what it *looks like*
- A practical method for finding out whether a class is still used before you delete it

## The cascade decides more than specificity

Most CSS problems are born from one common confusion: believing that "the more specific selector wins" is the main rule. It is not.

The cascade is an algorithm with ordered steps. Specificity is just **one** of them, evaluated after origin and layer. In practice this means a more specific selector can lose to a simpler one, if they sit in different layers.

The order of precedence, highest to lowest, for author styles:

1. Layers declared last (and rules outside any layer, which come before all of them)
2. Selector specificity
3. The order in which the rule appears in the file

The subtle part is item 1, and it is what changes the game.

### `!important` reverses the layer order

Here is the trap that catches almost everyone the first time. Inside a layer, `!important` behaves **backwards** from the normal order: the **first** declared layer wins, not the last.

I tested this in a browser rather than repeat what the docs say from memory:

```css
@layer base, utils;

@layer base {
  .a { color: red; }
  .b { color: red !important; }
}

@layer utils {
  .a { color: blue; }
  .b { color: blue !important; }
}
```

The element with `.a` ends up **blue** (`utils` was declared last, so it wins). The element with `.b` ends up **red**: `base` won, even though it is the first layer, because `!important` flips the priority.

The result measured in Chromium:

```
.a  -> rgb(0, 0, 255)   /* blue: the last layer wins */
.b  -> rgb(255, 0, 0)   /* red: !important flipped it */
```

The reason this is useful rather than merely confusing: inside layers, `!important` stops being an emergency button and becomes an exception tool that respects an order you control. Outside layers it remains what it always was, a sign that the cascade is disorganized.

### Declare the layer order in one place

`@layer` lets you separate **when the order is born** from **the content**. You declare the names once, at the top, then write each piece wherever it makes sense:

```css
/* the order is decided here, and only here */
@layer reset, tokens, layout, components, utilities;
```

```css
@layer components {
  .card {
    background: var(--surface);
    border-radius: var(--radius-md);
  }
}
```

```css
@layer utilities {
  .stack > * + * { margin-block-start: var(--space-4); }
}
```

With that, the question "who wins between the component style and the utility?" has a written answer, in a file, without counting specificity points. You no longer compute `(0,2,0)` against `(0,1,1)`. The layer decided first.

Support is mature: `@layer` has worked in every browser since **March 2022**.

## Variables that defend themselves

Defining a small set of tokens before styling anything is still the first step, and the cheapest:

```css
:root {
  --color-accent: hsl(156 45% 32%);
  --space-4: 1rem;
  --radius-md: 12px;
}
```

The gain is not aesthetic. It is that the question stops being "does this border have an 11px or 12px radius?" and becomes "does this use `--radius-md` or `--radius-lg`?", which has a binary, verifiable answer.

There is a second level, though, that most people skip: plain variables are **text strings** until the moment they are used. The browser validates nothing until it applies them, and that delay hides errors.

### `@property` gives the variable a type

The `@property` at-rule registers the variable with a type, and changes behavior in measurable ways:

```css
@property --gap {
  syntax: "<length>";
  inherits: false;
  initial-value: 8px;
}
```

Three things now hold:

- **An invalid value falls back to the default.** A `--gap: not-a-length` does not break the layout: the browser uses `8px`.
- **The variable has a type.** An animation loop over `--gap` does not need reparsing on every frame, because the type is known up front.
- **`inherits: false` narrows recalculation.** When the value changes, children do not need to be reprocessed.

I measured the first two in the browser:

```
--gap registered, no override    -> padding: 8px
--gap: not-a-length (invalid)    -> padding: 8px   /* fell back to initial-value */
```

Without `@property`, the second line would be unpredictable. With it, failing has defined behavior. And defined behavior is exactly what lets you delete code later.

Worth knowing that `var()` has a different mood: its second argument is the fallback used when the variable has no **usable** value. If the variable is registered with an `initial-value`, that initial value takes over and the fallback is never consulted. Those are two different layers of protection, not the same one.

```css
.unregistered { color: var(--does-not-exist, rebeccapurple); }  /* uses the fallback */
```

## Name by what the element is, not what it looks like

`.blue-card` breaks the day the design calls for a green card, and then someone creates `.blue-green-card`, and the name lies forever.

Prefer names that describe **function**:

- `.featured-card` instead of `.blue-card`
- `.secondary-card` instead of `.gray-card`
- `.warning-text` instead of `.red-text`

The practical rule that settles 90% of cases: if a color or a size shows up in the class name, the name is probably describing appearance. Those values belong in a variable, not in the name.

### One caution about nesting

Native CSS nesting is here, and that is good: global support is past **94%** and it works in current browsers with no build step. The risk is the same one preprocessors already taught us: nesting because you can, not because the selector needs it.

Nesting when the selector genuinely depends on the parent is legitimate:

```css
.card {
  .card__title { font-weight: 600; }
}
```

Nesting for convenience is what causes trouble:

```css
.page {
  .section {
    .card {
      .card__title { font-weight: 600; }
    }
  }
}
```

The second case produces a selector that only works inside three levels of context. Moving the component now means editing its CSS.

## Before deleting: find out whether the class is still used

"Sustainability is about removal" sounds lovely and is useless if you have no way to remove things safely. What makes removal possible is a verification tool, not courage.

On this blog, which is Astro with hand-written classes, what works is searching for the class across content and component files before touching anything:

```bash
# does the class show up in any article, component or page?
rg -n "featured-card" src/
```

An empty result means the class is a candidate. A single-file result means you know exactly what to test after the change.

When the CSS is generated by a build, the right check is the inverse: ask the browser which rules were actually used. In DevTools, the **Coverage** tab does exactly that: it shows how much of the loaded CSS was really applied.

The method matters less than its existence. CSS nobody can audit is CSS nobody deletes. That is how a 300-line file becomes 3,000.

### A quick checklist

- Does the variable already exist before I invent a new magic value?
- Does this selector depend on three levels of nesting to work?
- Does this class name describe appearance or function?
- If I delete this class, will something break on a page I did not test?

If the answer to the last question is "I am not sure", the problem is not your memory: it is CSS that cannot be audited.

## Conclusion

Sustainable CSS is not the CSS that is well organized today. It is the CSS that **allows itself to be reorganized tomorrow** without a scare.

Three changes carry almost all the weight:

- **Declare the layer order once**, at the top. The question "who wins" stops requiring mental arithmetic.
- **Register the variables that matter.** Failing gets defined behavior.
- **Have a way to check usage** before deleting. Without it, removal is a gamble.

The rest (names, nesting, file order) comes easier once those three foundations are in place.

## Sources and links

- [MDN: `@layer` — CSS at-rule](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@layer) — precedence between layers, including the `!important` reversal, and support since March 2022
- [MDN: Introduction to the CSS cascade](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_cascade/Cascade) — the order of the algorithm's steps, with origin and layer ahead of specificity
- [MDN: `var()`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/var) — when the fallback is consulted and what the "guaranteed-invalid value" is
- [MDN: Registering custom properties](https://developer.mozilla.org/en-US/docs/Web/CSS/Guides/Properties_and_values_API/Registering_properties) — `syntax`, `inherits` and `initial-value` in `@property`
- [Can I use: CSS Nesting](https://caniuse.com/css-nesting) — global coverage of native nesting and the per-browser table
- [W3C: CSS Properties and Values API Level 1](https://www.w3.org/TR/css-properties-values-api/) — the specification behind `@property`
