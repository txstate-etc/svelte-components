<!--
  @component
  Displays arbitrary JSON-ish data as a compact nested structure: property lists
  for objects (and Maps), bulleted lists for arrays (and Sets), scalars as text.
  Intended for read-only summaries like preview panes, not for editing.

  Long text is kept in check: leaf values cut off with an ellipsis after `maxtext`
  characters, line breaks are preserved, and a value that would need to wrap drops
  below its key as an indented block instead of snaking around it.

  Values are escaped text by default; the `allowHtml` prop renders values that
  contain markup as actual HTML in a framed, height-clipped block - only enable
  it for trusted payloads.

  Notes on odd input:
  - datetimes render as ISO8601 in the browser's timezone, whether they arrive as
    Date objects or ISO strings (e.g. UTC from a JSON API); use `format` to display
    them some other way
  - a Map renders like an object as long as every key is a string or has a custom
    toString; otherwise the Map is skipped entirely
  - cyclic structures are safe: a container that appears among its own ancestors
    renders the placeholder at the point of the cycle
  - empty arrays/objects, functions, and null/undefined render nothing
-->
<script lang="ts" context="module">
  import { dateToISOWithTZ } from 'txstate-utils'
  import { stripUnsafeHtml } from '../util/striphtml.js'

  /**
   * datetimes display as ISO8601 in the browser's timezone, whether they arrive
   * as Date objects or ISO strings (e.g. UTC from a JSON API); date-only strings
   * carry no timezone semantics and pass through untouched
   */
  const isoDatetimePattern = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2}(\.\d+)?)?(Z|[+-]\d{2}:?\d{2})?$/

  function localISO (dt: Date) {
    return dateToISOWithTZ(dt).replace('.000', '')
  }

  function renderScalar (value: any) {
    if (value instanceof Date) return localISO(value)
    if (typeof value === 'string' && isoDatetimePattern.test(value)) {
      const parsed = new Date(value)
      if (!isNaN(parsed.getTime())) return localISO(parsed)
    }
    return String(value)
  }

  /** simple HTML auto-detection: any <tag ...> or </tag> in the string */
  const htmlPattern = /<\/?[a-z][^>]*>/i

  /** a Map key we can display: a primitive or anything with a custom toString */
  function stringableKey (key: any) {
    if (key == null) return false
    if (typeof key === 'object' || typeof key === 'function') return key.toString !== Object.prototype.toString
    return true
  }

  function arrayEntries (value: any): any[] | undefined {
    if (Array.isArray(value)) return value
    if (value instanceof Set) return Array.from(value)
    return undefined
  }

  function objectEntries (value: any): [string, any][] | undefined {
    if (value instanceof Map) {
      const entries = Array.from(value.entries())
      if (entries.some(([k]) => !stringableKey(k))) return undefined
      return entries.map(([k, v]) => [String(k), v] as [string, any])
    }
    if (value != null && typeof value === 'object' && !(value instanceof Date)) return Object.entries(value)
    return undefined
  }
</script>

<script lang="ts">
  export let data: any
  /** where this value sits in the root data, e.g. ['sections', 0, 'heading']; the root is [] */
  export let path: (string | number)[] = []
  /**
   * how many nested arrays/objects deep we render before eliding with a
   * placeholder
   *
   * e.g. with the default of 5, { items: [{ moreitems: [{ id: 5 }] }] } displays
   * fully - the root object is level 0 and the { id: 5 } object is level 4 - but
   * a subarray or subobject inside { id: 5 } would render as the placeholder
   */
  export let maxlevel = 5
  /**
   * take over the display of any leaf value; receives the default rendering
   * (datetimes already rewritten as local ISO8601, everything else
   * stringified) plus the value's path, so it can do something else with
   * specific fields or types - including recognizing marker strings a data
   * source deliberately embedded, like '{"image": "https://..."}'
   *
   * return a string to display as text, return { html } to display markup the
   * formatter built itself - it renders regardless of allowHtml, because the
   * formatter is application code rather than data, though it is still
   * scrubbed with stripUnsafeHtml since the urls and labels interpolated into
   * it usually do come from the data - or return undefined to keep the
   * default rendering
   *
   * { html } drops below its key as an indented block by default; pass
   * inline: true for something compact like a link that should sit beside its
   * key the way a short scalar does
   */
  export let format: ((value: string, path: (string | number)[]) => string | { html: string, inline?: boolean } | undefined) | undefined = undefined
  /**
   * leaf values longer than this many characters are cut off with an ellipsis,
   * after `format` has had its say; set Infinity if you really want it all
   */
  export let maxtext = 200
  /**
   * render leaf values that contain HTML tags as actual HTML instead of escaped
   * text; they display as an indented block below their key and are exempt from
   * maxtext, since slicing markup in half would break it
   *
   * markup is scrubbed with stripUnsafeHtml before rendering (scripts, styles,
   * iframes, event handlers, and executable urls dropped), but that is a safety
   * net, not full sanitization; off by default because it means trusting the
   * data: only enable this when the payload is sanitized or comes from a trusted
   * source, otherwise you are opening your users up to XSS attacks
   */
  export let allowHtml = false
  /** the placeholders shown in place of data nested deeper than maxlevel, distinct so the reader knows what kind of data is hiding */
  export let elidedObjectText = '{ ... }'
  export let elidedArrayText = '[...]'
  export let elidedTooltip = 'deeper data not shown'
  /** tooltip on the indicator shown when a rendered html block is taller than its max height and gets clipped */
  export let clippedTooltip = 'more content not shown'
  export let className = ''
  /**
   * the containers above this one, used internally to detect cycles; a container
   * that appears among its own ancestors renders as the placeholder immediately
   * instead of repeating itself down to maxlevel
   */
  export let ancestors: any[] = []

  $: level = path.length
  $: arrayData = arrayEntries(data)
  $: objectData = arrayData == null ? objectEntries(data) : undefined
  $: elided = level >= maxlevel || ancestors.includes(data)
  $: childAncestors = [...ancestors, data]

  /**
   * a rendered string this long will essentially always need to wrap, so we drop
   * it below the key up front; that also lets the CSS de-emphasize wrapped blocks,
   * which it could not do if the drop only happened through inline-block layout
   */
  const BLOCKTEXT = 80

  /**
   * containers always drop below their key as a full-width block; scalars are
   * inline-blocks that stay beside the key until they need to wrap - with two
   * exceptions: a container the child will elide renders as a short placeholder,
   * so it stays beside the key, and a scalar whose rendered text contains line
   * breaks (or is long enough that wrapping is inevitable) drops below the key,
   * so the breaks don't leave text hanging in the middle of the row
   *
   * formatted values follow the same rules: { html } is a block unless the
   * formatter flagged it inline, text follows the scalar rules
   */
  function isBlockValue (value: any, key: string) {
    const formatted = applyFormat(value, [...path, key])
    if (formatted != null) {
      if (typeof formatted === 'object') return !formatted.inline
      const t = truncate(formatted)
      return t.includes('\n') || t.length > BLOCKTEXT
    }
    if (level + 1 >= maxlevel || childAncestors.includes(value)) return false
    if (arrayEntries(value) != null || objectEntries(value) != null) return true
    if (typeof value !== 'string') return false
    const rendered = formatValue(value)
    return isHtml(rendered) || rendered.includes('\n') || rendered.length > BLOCKTEXT
  }

  function isHtml (rendered: string) {
    // no DOMParser means no script/style stripping (i.e. during SSR), so behave
    // as if allowHtml were off; the browser re-renders as html when it hydrates
    return allowHtml && typeof DOMParser !== 'undefined' && htmlPattern.test(rendered)
  }

  // measured heights of an html block's clip window and its natural content;
  // when the content is taller, we fade the bottom and show an indicator
  let htmlClipHeight = 0
  let htmlContentHeight = 0
  $: htmlClipped = htmlContentHeight > htmlClipHeight + 1

  function truncate (str: string) {
    return str.length > maxtext ? str.slice(0, maxtext).trimEnd() + '…' : str
  }

  /**
   * run the format prop on a leaf value's default rendering; an { html }
   * result needs DOMParser for scrubbing, so without one (i.e. during SSR) it
   * is ignored and the value renders the default way until the browser
   * hydrates
   */
  function applyFormat (value: any, atPath: (string | number)[]): string | { html: string, inline?: boolean } | undefined {
    if (format == null) return undefined
    if (value == null || (typeof value === 'object' && !(value instanceof Date)) || typeof value === 'function') return undefined
    const result = format(renderScalar(value), atPath)
    if (result != null && typeof result === 'object' && typeof DOMParser === 'undefined') return undefined
    return result
  }

  $: formatted = applyFormat(data, path)
  $: formattedHtml = formatted != null && typeof formatted === 'object' ? stripUnsafeHtml(formatted.html) : undefined
  $: formattedText = typeof formatted === 'string' ? truncate(formatted) : undefined

  function formatValue (value: any) {
    const str = renderScalar(value)
    // never truncate html - slicing markup in half would break it
    if (isHtml(str)) return str
    return truncate(str)
  }
</script>

{#if formattedHtml != null}
  <span class="nested-data-scalar nested-data-trusted {className}">{@html formattedHtml}</span>
{:else if formattedText != null}
  <span class="nested-data-scalar {className}">{formattedText}</span>
{:else if arrayData}
  {#if elided}
    <span class="nested-data-elided {className}" title={elidedTooltip}>{elidedArrayText}</span>
  {:else if arrayData.length}
    <ul class="nested-data {className}">
      {#each arrayData as entry, i (i)}
        <li><svelte:self data={entry} path={[...path, i]} ancestors={childAncestors} {maxlevel} {format} {maxtext} {allowHtml} {elidedObjectText} {elidedArrayText} {elidedTooltip} {clippedTooltip} /></li>
      {/each}
    </ul>
  {/if}
{:else if objectData}
  {#if elided}
    <span class="nested-data-elided {className}" title={elidedTooltip}>{elidedObjectText}</span>
  {:else}
    <dl class="nested-data {className}">
      {#each objectData as [key, value], i (i)}
        <div>
          <dt>{key}:</dt>
          <dd class:nested-data-block={isBlockValue(value, key)}><svelte:self data={value} path={[...path, key]} ancestors={childAncestors} {maxlevel} {format} {maxtext} {allowHtml} {elidedObjectText} {elidedArrayText} {elidedTooltip} {clippedTooltip} /></dd>
        </div>
      {/each}
    </dl>
  {/if}
{:else if data != null && (typeof data !== 'object' || data instanceof Date) && typeof data !== 'function'}
  {#if isHtml(formatValue(data))}
    <!-- the frame and legend keep rendered markup (especially lists) from being mistaken for the data's own structure -->
    <fieldset class="nested-data-scalar nested-data-html {className}" class:nested-data-clipped={htmlClipped}>
      <legend>HTML</legend>
      <div class="nested-data-html-clip" bind:clientHeight={htmlClipHeight}>
        <div bind:offsetHeight={htmlContentHeight}>{@html stripUnsafeHtml(formatValue(data))}</div>
      </div>
      {#if htmlClipped}
        <div class="nested-data-html-more" title={clippedTooltip}>&hellip;</div>
      {/if}
    </fieldset>
  {:else}
    <span class="nested-data-scalar {className}">{formatValue(data)}</span>
  {/if}
{/if}

<style>
  .nested-data {
    margin: 0;
    padding: 0;
    line-height: 1.3;
  }
  ul.nested-data {
    margin-left: 0.75em;
    padding-left: 0.9em;
    list-style: disc;
  }
  /*
   * hanging indent: a value that fits stays on the same line as its key, but the
   * dd is an inline-block, so as soon as its content needs to wrap, the whole
   * block drops below the key and picks up the row's padding as its indent;
   * text-indent only pulls the first line (the key) back to the left edge
   */
  dl.nested-data > div {
    padding-left: 0.75em;
    text-indent: -0.75em;
  }
  dl.nested-data dt {
    display: inline;
    font-weight: 600;
  }
  dl.nested-data dd {
    display: inline-block;
    margin: 0;
    max-width: 100%;
    text-indent: 0;
    vertical-align: top;
  }
  dl.nested-data dd.nested-data-block {
    display: block;
  }
  .nested-data-scalar {
    white-space: pre-line;
    overflow-wrap: break-word;
  }
  /* markup built by the format prop renders inline, unframed */
  .nested-data-trusted {
    white-space: normal;
  }
  .nested-data-trusted :global(img) {
    max-width: 100%;
    vertical-align: middle;
  }
  /* html brings its own paragraphs and breaks; pre-line would double them up */
  .nested-data-html {
    white-space: normal;
    display: block;
    border: 1px dotted;
    border-radius: 0.25em;
    margin: 0.2em 0 0.2em 0;
    padding: 0 0.6em 0.4em;
    /* fieldsets refuse to shrink below their content width without this */
    min-width: 0;
  }
  .nested-data-html legend {
    font-size: 0.7em;
    font-weight: 600;
    letter-spacing: 0.06em;
    padding: 0 0.4em;
    margin-left: -0.4em;
    opacity: 0.75;
  }
  .nested-data-html-clip {
    max-height: var(--nested-data-html-max-height, 12em);
    overflow: hidden;
  }
  /* fade the content itself so the effect works on any background */
  .nested-data-clipped .nested-data-html-clip {
    -webkit-mask-image: linear-gradient(to bottom, #000 calc(100% - 1.5em), transparent);
    mask-image: linear-gradient(to bottom, #000 calc(100% - 1.5em), transparent);
  }
  .nested-data-html-more {
    text-align: center;
    line-height: 1;
    opacity: var(--nested-data-elided-opacity, 0.65);
  }
  .nested-data-html :global(img) {
    max-width: 100%;
  }
  /* the browser's default paragraph margins would pad out the block's top and bottom (first-of-type since the legend is always the first child) */
  .nested-data-html :global(p:first-of-type) {
    margin-top: 0;
  }
  .nested-data-html :global(p:last-of-type) {
    margin-bottom: 0;
  }
  /* de-emphasize blocks of text that have dropped below their key; formatter-built markup keeps full strength */
  dl.nested-data dd.nested-data-block > :global(.nested-data-scalar:not(.nested-data-trusted)) {
    opacity: var(--nested-data-block-opacity, 0.85);
  }
  .nested-data-elided {
    opacity: var(--nested-data-elided-opacity, 0.65);
  }
</style>
