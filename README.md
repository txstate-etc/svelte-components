# svelte-components
A set of generically useful components and related `use:` actions for svelte.

## `<Components>`
- Card
- CardLayout
- [CollapsingTable](/docs/CollapsingTable.md)
- [ConditionalWrapper](/docs/ConditionalWrapper.md)
- [FocusLock](/docs/Modal.md#FocusLock)
- Loading
- Lottie
- [Modal](/docs/Modal.md#Modal)
- MultiSelect
- [PopupMenu](/docs/PopupMenu.md)
- [ScreenReaderOnly](/docs/ScreenReaderOnly.md)

## `use:` Actions
- [buttonify](/docs/actions.md#buttonify)
- elementqueries
- [glue](/docs/actions.md#glue)
- [offset](/docs/actions.md#offset)
- passActions
- [portal](/docs/actions.md#portal)
- [resize](/docs/actions.md#resize)
- sticky
- stickyfixed

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
