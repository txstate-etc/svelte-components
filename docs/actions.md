# Actions

## use:glue
This action glues the element it is placed on to the target specified, with a specified alignment option. The element is placed in document.body so that it cannot be constrained or hidden by overflow:hidden, then it is positioned to match the target element. It is most useful for dropdown or autocomplete menus.
```svelte
<button bind:this={menubutton}>Activate Menu</button>
<ul use:glue={{ element: menubutton, align: 'bottomright' }}>
  <li>Menu Item 1</li>
  <li>Menu Item 2</li>
```
