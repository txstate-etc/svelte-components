# PopupMenu

This component is meant to display a menu of options to the user, activated by clicking
any element. It can also be controlled from the parent, by binding the `menushown` boolean.

## Props
* `buttonelement: HTMLElement` (required) - The DOM element that will act as the "button" for this menu. The menu will be placed next to the button and be controlled by the button. Keyboard access will be enabled when the button has focus. This component adds all appropriate attributes (tabindex, roles, and aria) automatically.
* `items: PopupMenuItem[]` (required) - The list of menu items to be shown. Parent may change this at any time based on user activity.
* `menushown?: boolean` (default `false`) - Bind this prop to track/change the visible state of the menu from the parent.
* `value?: string` (default no selection) - Bind this prop to track/change the currently selected value from the parent.
* `align?: GlueAlignOpts` (default `auto`) - Control where the menu will appear. Default is to use the current viewport to make a decision to maximize potential for menu growth.
* `cover?: boolean` (default `false`) - When the menu is active, should it cover the button or be rendered above/below it?
* `showSelected?: boolean` (default `true`) - When an item is currently selected, should it appear in the menu (with a visual indicator), or simply be removed from the list (showSelected: `false`)?
* `width?: string` (default `undefined`) - When defined, this width will be passed through to the menu's CSS width. Use a valid CSS dimension such as `33em` or `159px`. Generally this will be used when you need to match the menu width to something else, like the button. If the width is static like `100%` a simple CSS rule is likely more efficient.
* `computedalign: readable<{ valign: 'top'|'bottom', halign: 'left'|'right' }>` (default store is provided) - Bind this prop to receive a store that is updated each time a menu placement decision is made. Example of when this is useful is when you are trying to round corners of your button and need to know whether the menu is above or below your button so you know which corners to round and which to leave square. Note that the values do not update when the menu is hidden, so you may need to rely on `menushown` as well.
* `usePortal?: HTMLElement|true` (default `false`) - If the menu would be clipped by an `overflow: hidden`, you can set this prop and it will be placed in the specified container, or the `document.body` if you simply say `true`. Placement will still be calculated correctly, unless there are scrolling containers between the button and the menu.
* `emptyText?: string` (default `¯\_(ツ)_/¯`) - When there are no items (e.g. it's a filtered search and there were no results), we still display one disabled item in the menu to let the user know what is going on. Use this prop to specify the message.
* `menuContainerClass?: string` (default `''`) - CSS class to pass through so you can do extra styling work
* `menuClass?: string` (default `''`) - CSS class to pass through so you can do extra styling work
* `menuItemClass?: string` (default `''`) - CSS class to pass through so you can do extra styling work
* `menuItemHilitedClass?: string` (default `''`) - CSS class to pass through so you can do extra styling work
* `menuItemSelectedClass?: string` (default `''`) - CSS class to pass through so you can do extra styling work

## Events
* `on:change` - Dispatched any time a new value is selected. Does not fire when you change the `value` property from the outside. Event detail will be the full PopupMenuItem object that was selected.

## Types
* `PopupMenuItem: { value: string, label?: string, disabled?: boolean }` - Each item must have a unique non-empty value. Display label is optional, as is a `disabled` status that will show the item in the list but not allow users to hilite or select it.

## Disabling
Since there are so many different possibilities for the button you attach to, the PopupMenu does not have a `disabled` prop. If the PopupMenu should be disabled, simply remove it from the DOM with an `{#if}` block. Remember to also set `aria-disabled` on your button and likely provide some visual indicators like `cursor: default` or the `disabled` attribute on elements that support it.
