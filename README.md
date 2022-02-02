# svelte-components
A set of generically useful components for svelte.

## Components
- [CollapsingTable](/docs/CollapsingTable.md)
- [ConditionalWrapper](/docs/ConditionalWrapper.md)
- [FocusLock](/docs/Modal.md#FocusLock)
- [Modal](/docs/Modal.md#Modal)
- [PopupMenu](/docs/PopupMenu.md)
- [ScreenReaderOnly](/docs/ScreenReaderOnly.md)

## Actions
- [use:buttonify](/docs/actions.md#use:buttonify)
- [use:glue](/docs/actions.md#use:glue)
- [use:offset](/docs/actions.md#use:offset)
- [use:portal](/docs/actions.md#use:portal)
- [use:resize](/docs/actions.md#use:resize)

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
