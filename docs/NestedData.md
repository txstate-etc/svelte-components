# [NestedData](./../src/lib/components/NestedData.svelte)
Sometimes you have a blob of structured data - an API payload, a CMS data entry, an audit
log detail - and you just need the user to be able to see what's in it. `JSON.stringify` in
a `<pre>` is hard on the eyes and building a bespoke display for every payload shape gets
old fast. This component takes arbitrary data and displays it as a compact nested structure:
a property list for each object, a bulleted list for each array, scalars as text.
```svelte
<NestedData data={payload} />
```
It's for read-only summaries like preview panes and detail popups, not for editing.

## Dates
Datetimes are rewritten to ISO8601 in the browser's timezone, whether they arrive as `Date`
objects or as ISO strings (a JSON API will usually hand you UTC strings ending in `Z`).
Your users get `2026-03-04T09:30:00-0600` instead of doing timezone math in their heads,
and since the output is still ISO8601, nothing downstream should be surprised. Date-only
strings like `1899-05-10` carry no timezone semantics and pass through untouched. If you
want dates displayed some other way, see `format` below.

## Depth
Deeply nested data would turn the display into an unreadable staircase, so recursion stops
after `maxlevel` (default 5) levels of containers and anything deeper renders as a
placeholder: `{ ... }` for an object, `[...]` for an array, so the reader at least knows
what kind of data is hiding. With the default, this displays fully:
```js
{ items: [{ moreitems: [{ id: 5, name: 'An Item' }] }] }
```
but a subarray or subobject inside the `id: 5` object would render as `[...]` or `{ ... }`.

Cyclic structures are handled the same way, but eagerly: a container that appears among its
own ancestors renders the placeholder right at the point of the cycle instead of repeating
itself down to `maxlevel`. A shared reference that isn't a cycle - the same object appearing
under two different keys - still renders normally in both places.

## Props
* `data: any` (required) - The data to display. Objects and Maps render as property lists,
  arrays and Sets as bulleted lists. A Map only renders if every key is a string or has a
  custom `toString`; otherwise the whole Map is skipped. Empty containers, functions, and
  null/undefined render nothing.
* `maxlevel: number` (default 5) - How many container levels deep to render before eliding.
* `format?: (value: string, path: (string|number)[]) => string | undefined` - Take over the
  display of any leaf value. You receive the default rendering (datetimes already rewritten,
  everything else stringified) and the value's path from the root, e.g.
  `['sections', 0, 'heading']`, so you can target specific fields:
  ```js
  function format (value, path) {
    if (path[path.length - 1] === 'price') return `$${value}`
    // return undefined to keep the default rendering
  }
  ```
* `elidedObjectText: string` (default `{ ... }`), `elidedArrayText: string` (default
  `[...]`), and `elidedTooltip: string` (default `deeper data not shown`) - The
  placeholders for data nested past `maxlevel`, overridable mostly so they can be
  translated.
* `className: string` - Added to the root element for styling. The inner lists carry
  `nested-data` and the placeholder carries `nested-data-elided` if you need deeper hooks.
