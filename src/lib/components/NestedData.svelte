<!--
  @component
  Displays arbitrary JSON-ish data as a compact nested structure: property lists
  for objects (and Maps), bulleted lists for arrays (and Sets), scalars as text.
  Intended for read-only summaries like preview panes, not for editing.

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
   * (datetimes already rewritten as local ISO8601, everything else stringified)
   * plus the value's path, so it can do something else with specific fields or
   * types; return undefined to keep the default rendering
   */
  export let format: ((value: string, path: (string | number)[]) => string | undefined) | undefined = undefined
  /** the placeholders shown in place of data nested deeper than maxlevel, distinct so the reader knows what kind of data is hiding */
  export let elidedObjectText = '{ ... }'
  export let elidedArrayText = '[...]'
  export let elidedTooltip = 'deeper data not shown'
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

  function formatValue (value: any, atPath: (string | number)[]) {
    const str = renderScalar(value)
    return format?.(str, atPath) ?? str
  }
</script>

{#if arrayData}
  {#if elided}
    <span class="nested-data-elided {className}" title={elidedTooltip}>{elidedArrayText}</span>
  {:else if arrayData.length}
    <ul class="nested-data {className}">
      {#each arrayData as entry, i (i)}
        <li><svelte:self data={entry} path={[...path, i]} ancestors={childAncestors} {maxlevel} {format} {elidedObjectText} {elidedArrayText} {elidedTooltip} /></li>
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
          <dd><svelte:self data={value} path={[...path, key]} ancestors={childAncestors} {maxlevel} {format} {elidedObjectText} {elidedArrayText} {elidedTooltip} /></dd>
        </div>
      {/each}
    </dl>
  {/if}
{:else if data != null && (typeof data !== 'object' || data instanceof Date) && typeof data !== 'function'}
  {formatValue(data, path)}
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
  dl.nested-data dt {
    display: inline;
    font-weight: 600;
  }
  dl.nested-data dd {
    display: inline;
    margin: 0;
  }
  /*
   * an object directly beneath a key drops below it, indented a step; the child
   * combinator keeps the indent from leaking into deeper levels, so an object
   * inside an array entry hangs on the li's bullet with no extra margin
   */
  dl.nested-data dd > :global(dl.nested-data) {
    margin-left: 0.75em;
  }
  .nested-data-elided {
    opacity: 0.65;
  }
</style>
