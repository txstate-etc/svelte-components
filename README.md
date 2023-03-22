# svelte-components
A set of generically useful components and related `use:` actions for svelte.

## `<Components>`
*Italicized entries* point to source only (no .md file).
- *[Card](./src/lib/components/Card.svelte)*
- *[CardLayout](./src/lib/components/CardLayout.svelte)*
- [CollapsingTable](./docs/CollapsingTable.md)
- [ConditionalWrapper](./docs/ConditionalWrapper.md)
- [FocusLock](./docs/Modal.md#FocusLock)
- *[Loading](./src/lib/components/Loading.svelte)*
- *[Lottie](./src/lib/components/Lottie.svelte)*
- [Modal](./docs/Modal.md#Modal)
- *[MultiSelect](./src/lib/components/MultiSelect.svelte)*
- [PopupMenu](./docs/PopupMenu.md)
- [ScreenReaderOnly](./docs/ScreenReaderOnly.md)

## `use:` Actions
*Italicized entries* point to source only (no .md file).
- [buttonify](./docs/actions.md#buttonify)
- *[elementqueries](./src/lib/actions/elementqueries.ts)*
- [glue](./docs/actions.md#glue)
- [offset](./docs/actions.md#offset)
- *[passActions](./src/lib/actions/passactions.ts)*
- [portal](./docs/actions.md#portal)
- [resize](./docs/actions.md#resize)
- *[sticky](./src/lib/actions/sticky.ts)*
- *[stickyfixed](./src/lib/actions/stickyfixed.ts)*

## Developing

Installed dependencies with `npm install`, then start the development server:

```bash
npm run dev

# or start the server and open the app in a new browser tab
npm run dev -- --open
```

## Publishing to npm

```bash
npm run package
cd package
npm publish
```
