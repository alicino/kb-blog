---
title: "Typography for long-form reading"
description: "Font choices, line height, and column width that make a difference after the tenth paragraph."
publishDate: 2026-06-10
author: "Alicino"
category: "Design"
tags: ["typography", "design-system", "accessibility"]
draft: false
---

Good typography is not noticed when it is right. It is noticed when it is
wrong, usually as a vague tiredness that appears after a few paragraphs.

## Column width matters more than it seems

A good reference is to keep between 60 and 75 characters per line. Columns
that are too wide make the eye lose its place when returning to the start of
a line; columns that are too narrow fragment the reading rhythm.

## Generous line height in long texts

For body text, something between 1.5 and 1.7 usually balances density and
comfort well. Headings can, and should, be more compact.

```css
article {
  max-width: 68ch;
  line-height: 1.65;
}
```

## Hierarchy without excess variation

Three well-chosen type families, one for headings, one for body, one for
interface, already cover practically any need. More than that tends to read
as noise rather than hierarchy.

### Contrast is also typography

Text color on background, minimum font size, and letter spacing in capitals
are part of the same conversation. Accessible typography is not a separate
step from design, it is the design.
