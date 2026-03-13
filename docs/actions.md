# `use:`Actions

## `buttonify`
This action turns any HTML element into an accessible button that responds to keyboard events and has
`role="button"` and the `tabindex` attribute set. You are still responsible for making sure it has
readable content or a good label. Does NOT change styling at all.
```svelte
<div use:buttonify on:click={onClick}>You can tab to me and click me with the Enter key</div>
```

## `glue`
This action glues the element it is placed on to the target specified, with a specified alignment
option. It is most useful for dropdowns, autocomplete menus, and tooltips.

The element will have `position: fixed` applied to it so it will escape whatever box it's in. It is not moved to a new place in the DOM. You may need to give it a `z-index` to make sure it appears above other elements.

If a parent element creates a containing block for fixed elements, the `portal` action can be used to move the element to a new place in the DOM. `glue` will automatically figure it out and update the positioning math.

### Alignment options

**Corner alignments** place matching corners of the element next to the target:
`topleft`, `topright`, `bottomleft`, `bottomright`

**Side alignments** center the element along one side of the target:
`top`, `bottom`, `left`, `right`

**Auto alignments** pick between two or more options based on available viewport space:
- `auto` — choose between all four corners (default)
- `autoleft` / `autoright` — choose top vs bottom, locked to one horizontal side
- `topauto` / `bottomauto` — choose left vs right, locked to one vertical side
- `automiddle` — choose between `top` and `bottom`
- `middleauto` — choose between `left` and `right`
- `middle` — choose between `top`, `bottom`, `left`, and `right`

The `cover` option controls whether the element overlaps the target (`true`) or sits adjacent to it (`false`, default). The `gap` option adds pixels of space between the element and target.

When `align` is `middle` and `cover` is `true`, the element is centered directly over the target.
```svelte
<button bind:this={menubutton}>Activate Menu</button>
<ul use:glue={{ target: menubutton, align: 'bottomright' }}>
  <li>Menu Item 1</li>
  <li>Menu Item 2</li>
</ul>
```

## `offset`
This action allows you to observe any DOM element's position in the body. You pass in a svelte store
and it will be updated when the element moves.

Another configuration option is `debounce: number`, which will debounce the updates for the specified
number of milliseconds. Use this option if you will make a complicated calculation after each update and do not
want to perform the calculation multiple times during a single animation or while the user is resizing
their viewport/window. It will defer the updates until the animation or resizing stops for at least `debounce`
milliseconds.
```svelte
<script>
  const offset = writable({ top: 0, left: 0, bottom: 0, right: 0 })
</script>
<div use:offset={{ store: offset }}>distance between me and body top is {$offset.top}</div>
```

## `portal`
This action allows you to move an element to a new place in the DOM upon mount. It's useful when your component
is sensitive to getting clipped by parents with `overflow: hidden` or for anything like a modal or toast message
that needs to be positioned relative to the body, but created within a smaller component, like a web form.

For convenience, the default is to move it to `document.body` when you `use:portal` without any config:
```svelte
<div use:portal>I'm in the body now!</div>
```
If you are accepting an optional target as a prop, this may cause unexpected behavior where your parent component
declines to pass a portal target, but your element ends up in `document.body`. To prevent this, you may pass `null`
instead of `undefined`, and the element will stay where it was before the change to `null`:
```svelte
<script>
  export let portaltarget = undefined
</script>
<div use:portal={portaltarget || null}></div>
```

## `resize`
This action allows you to observe an element's width and height with the `ResizeObserver`. Svelte has a built-in
`bind:clientWidth` functionality, but it works by inserting an invisible iframe into the DOM for each observation,
which is a little ugly and potentially slow.

You pass in a svelte store and it will be updated when the element's size changes.

Another configuration option is `debounce: number`, which will debounce the updates for the specified
number of milliseconds. Use this option if you will make a complicated calculation after each update and do not
want to perform the calculation multiple times during a single animation or while the user is resizing
their viewport/window. It will defer the updates until the animation or resizing stops for at least `debounce`
milliseconds.
```svelte
<script>
  const size = writable({ clientWidth: 100, clientHeight: 100, offsetWidth: 100, offsetHeight: 100 })
</script>
<div use:resize={{ store: size }}>My dimensions are {$size.offsetWidth}x{$size.offsetHeight}</div>
```
