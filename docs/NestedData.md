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

## Long text
A paragraph-sized value shouldn't get to wreck the layout. Leaf values are cut off with an
ellipsis after `maxtext` (default 200) characters, line breaks within them are preserved
(`white-space: pre-line`), and a value stays on the same line as its key only while it
fits - as soon as it needs to wrap, or contains a line break of its own, the whole block
drops below the key, indented a step, instead of snaking around it.

## HTML
CMS-flavored payloads often carry rich text fields. With the `allowHtml` prop, any leaf
value containing something tag-shaped (`<p>`, `</em>`, `<img ...>`) renders as actual HTML
in an indented block below its key, with images capped at container width. The block is
framed with a dotted border and a small `HTML` legend so that markup with its own lists
can't be mistaken for the structure of the data.

HTML values are exempt from `maxtext`, since slicing markup in half would break it.
Instead, the block clips to a max height, and when content actually gets cut off, the
bottom fades out and an ellipsis appears so the reader knows there's more. The height is
adjustable - see Styling below.

As a safety net, markup is scrubbed before rendering, using the browser's own (inert) DOM
parsing rather than fragile regexes: `script`/`style` and other non-content elements
(iframes, objects, and friends) are removed, inline event handlers are dropped, and urls
with executable schemes like `javascript:` are deleted (inline `data:image` urls survive,
since nothing executes in an img src). Forms are kept for display but stripped of their
`action`, and svg is kept minus its smuggling compartments - `foreignObject` and the SMIL
animation elements. The scrubber is exported
as `stripUnsafeHtml` in case you need the same treatment outside this component. Where
there's no `DOMParser` - i.e. during server-side rendering - the component behaves as if
`allowHtml` were off and upgrades to rendered HTML when it hydrates in the browser.

Even so, this is deliberately simpler than a real sanitizer like DOMPurify, so `allowHtml`
is still off by default and rendering HTML still means trusting the data: only enable it
when the payload is sanitized or comes from a trusted source, otherwise you are opening
your users up to XSS attacks.

## Styling
The purely visual knobs are CSS custom properties rather than props. Svelte lets you set
those right on the component:
```svelte
<NestedData data={payload} allowHtml
  --nested-data-block-opacity="0.7"
  --nested-data-elided-opacity="0.5"
  --nested-data-html-max-height="8em"
/>
```
* `--nested-data-block-opacity` (default `0.85`) - Text blocks that drop below their key are
  slightly transparent to set them off from the structure.
* `--nested-data-elided-opacity` (default `0.65`) - The `{ ... }`/`[...]` placeholders and
  the clipped-html indicator.
* `--nested-data-html-max-height` (default `12em`) - Where rendered html blocks clip.

They're ordinary custom properties, so you can also set them on any ancestor element to
theme every instance at once. For anything heavier, the `className` prop and the
`nested-data-*` classes are your hooks.

## Props
* `data: any` (required) - The data to display. Objects and Maps render as property lists,
  arrays and Sets as bulleted lists. A Map only renders if every key is a string or has a
  custom `toString`; otherwise the whole Map is skipped. Empty containers, functions, and
  null/undefined render nothing.
* `maxlevel: number` (default 5) - How many container levels deep to render before eliding.
* `maxtext: number` (default 200) - Leaf values longer than this many characters are cut off
  with an ellipsis, after `format` has had its say. Set `Infinity` if you really want it all.
* `allowHtml: boolean` (default false) - Render leaf values containing markup as actual HTML.
  See the HTML section above, especially before enabling it on untrusted data.
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
  `[...]`), `elidedTooltip: string` (default `deeper data not shown`), and
  `clippedTooltip: string` (default `more content not shown`) - The placeholders for data
  nested past `maxlevel` and the tooltips explaining them, overridable mostly so they can
  be translated.
* `className: string` - Added to the root element for styling. The inner lists carry
  `nested-data`, the placeholders carry `nested-data-elided`, and html blocks carry
  `nested-data-html` if you need deeper hooks.
