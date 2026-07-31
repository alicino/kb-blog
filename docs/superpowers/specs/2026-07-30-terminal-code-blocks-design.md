# Terminal/editor frame for code blocks

## Goal

Replace the current plain Shiki-rendered `<pre>` blocks with framed code blocks in the style of https://sourcier.uk/blog/improving-code-blocks-astro/: shell commands get a terminal-window look (macOS traffic-light dots), other languages get a neutral editor frame. Both get a copy-to-clipboard button and line numbers.

## Approach

Adopt the `astro-expressive-code` integration instead of hand-rolling a rehype plugin + custom CSS/JS. It is the same library the reference article uses, ships frames/copy-button/line-numbers out of the box, and removes the need to maintain that logic ourselves.

### Config changes (`astro.config.mjs`)

- Add `expressiveCode()` to the `integrations` array, positioned **before** `mdx()` (required ordering for MDX support).
- Remove the existing `markdown.shikiConfig` block — Expressive Code owns Shiki internally and disables Astro's built-in syntax highlighting itself.
- Configure:
  - `themes: ['github-light', 'github-dark']` — keep the current theme pair, only the frame chrome changes, not the syntax colors.
  - `useDarkModeMediaQuery: false` — the site does not use a media-query-driven dark mode.
  - `themeCssSelector: (theme) => `[data-theme='${theme.type}']`` — Shiki marks `github-light`/`github-dark` with `type: 'light'|'dark'`, which lines up exactly with the `data-theme` attribute `ThemeToggle.astro` already sets on `<html>`. This lets Expressive Code's theme switching piggyback on the existing toggle with no duplicated logic and no flash of unstyled content (the inline head script already sets `data-theme` before paint).
  - Line numbers: leave at library default (enabled).

### Frame behavior (library default, no extra config needed)

- `bash`, `sh`, `zsh`, `ps1` code fences render as a terminal frame (traffic-light dots, no filename tab unless `title="..."` is set on the fence).
- All other languages render as an editor frame (neutral border/header; shows a filename tab only when the fence has `title="..."`).
- Copy button included automatically in both frame types.

### CSS cleanup (`src/styles/global.css`)

- Remove `.prose pre` and `.prose pre code` (lines ~372-386) — these hand-rolled border/padding/radius rules become redundant and would visually conflict with Expressive Code's own generated frame markup/CSS.
- `.prose code` (inline code spans outside fenced blocks) is untouched — Expressive Code only transforms fenced code blocks, not inline code.

## Non-goals

- No retrofitting of `title="..."` onto existing articles' code fences. Existing fences without a title keep rendering without a filename tab — this is expected, not a bug.
- No change to the Shiki theme pair (`github-light` / `github-dark`) or to syntax highlight colors.
- No custom rehype plugin, no hand-written copy-button JS, no hand-written CSS for the frame chrome itself.

## Testing / verification

- `npm run check` and `npm run build` must pass (build already fails on any type error per project convention).
- `npm run dev` and visually inspect at least one article with a shell (`bash`) code block and one with a non-shell (e.g. `ts`/`js`) code block, in both light and dark mode (toggle via the existing `ThemeToggle`), to confirm:
  - Terminal frame (dots) appears only on the shell block.
  - Editor frame appears on the other block.
  - Copy button works in both.
  - Theme toggle switches the code block theme instantly, matching the rest of the page, no flash.
- No test suite exists in this project (per `CLAUDE.md`); manual verification via dev server is the standard practice for UI changes here.
