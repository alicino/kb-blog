---
title: "Writing CSS That Still Makes Sense a Year From Now"
description: "Some simple conventions for naming, variables, and organization that prevent CSS nobody wants to touch."
publishDate: 2026-07-15
author: "Alicino"
category: "Design"
tags: ["css", "design-system", "maintainability"]
draft: false
coverAlt: "Illustration of overlapping style layers"
---

CSS rarely becomes bad all at once. It gets worse gradually, one `!important`
at a time, until nobody knows for sure what can be safely removed.

## Start with variables, not components

Before styling anything, define a small set of variables:

```css
:root {
  --color-accent: hsl(156 45% 32%);
  --space-4: 1rem;
  --radius-md: 12px;
}
```

This creates a shared vocabulary. Instead of "does this border have an 11px or
12px radius?", the question becomes "does this use `--radius-md` or
`--radius-lg`?" - much easier to review.

## Name by what the element is, not what it looks like

`.blue-card` breaks the day the design calls for a green card. Prefer names
that describe function: `.featured-card`, `.secondary-card`.

![Placeholder illustrating design layers](/placeholder.svg)

### A quick checklist

- Does the variable already exist before I invent a new magic value?
- Does this selector depend on three levels of nesting to work?
- If I delete this class, will something break on a page I did not test?

If the answer to the last question is "I am not sure", that is already a
sign that the CSS is more fragile than it should be.

## Sustainability is about removal, not just addition

A healthy design system allows deleting dead CSS with confidence. This is only
possible when styles are predictable enough to know, just by looking, what
will break.