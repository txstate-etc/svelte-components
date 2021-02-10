<script lang="ts">
  import { DeepStore } from '../lib'
  import { CollapsingTableColumn } from '../types'
  import { derived } from 'svelte/store'
  import PopupMenu from './PopupMenu.svelte'
  import ConditionalWrapper from './ConditionalWrapper.svelte'
  import ScreenReaderOnly from './ScreenReaderOnly.svelte'
  export let tableClass = ''
  export let bodyRowClass = ''
  export let bodyCellClass = ''
  export let headerRowClass = ''
  export let headerCellClass = ''
  export let headerButtonIconComponent: Function | undefined = undefined
  export let menuClass = ''
  export let menuItemClass = ''
  export let menuItemHilitedClass = ''
  export let items: any[]
  export let config: CollapsingTableColumn[]|undefined = undefined
  export let defaultCellWidth = 150
  let columns: CollapsingTableColumn[]
  let width: number = 320
  let selectedkey: string | undefined
  let keykeys: string[] = []
  $: firstrow = items?.[0] ?? {}
  $: columns = config ?? Object.keys(firstrow).map(key => ({ key }))
  function reactToColumns (columns: CollapsingTableColumn[]) {
    if (!columns.some(c => c.neverhide)) {
      columns[0].neverhide = true
    }
    columns // stable sort
      .map((c, i) => ({ col: c, idx: i}))
      .sort((a, b) => (a.col.neverhide ? 0 : 1) - (b.col.neverhide ? 0 : 1) || a.idx - b.idx)
      .map(o => o.col)
    if (!selectedkey) selectedkey = columns.find(c => !c.neverhide)?.key
    keykeys = columns.filter(c => c.neverhide).map(c => c.key)
  }
  $: reactToColumns(columns)

  $: itemkeys = items.map(item => item.id ?? item._id ?? keykeys.map(k => item[k]).join('.'))

  const state = new DeepStore({
    keepcolumns: [] as (CollapsingTableColumn & { widthPercent?: number })[],
    hiddencolumns: [] as CollapsingTableColumn[],
    lastcolumn: 0
  })
  const menuitems = derived(state, obj => obj.hiddencolumns.map(c => ({ value: c.key, label: c.title })))
  function react (width: number, selectedkey?: string) {
    const selectedcol = columns.find(c => c.key === selectedkey) ?? columns[1]
    const keepcolumns: CollapsingTableColumn[] = []
    const hiddencolumns: CollapsingTableColumn[] = []
    let used = columns.filter(c => c.neverhide || c === selectedcol).reduce((sum, col) => sum + (col.width ?? defaultCellWidth), 0)
    for (const col of columns) {
      if (col.neverhide || col === selectedcol || used + (col.width ?? defaultCellWidth) < width) {
        keepcolumns.push(col)
        if (col !== selectedcol && !col.neverhide) used += col.width ?? defaultCellWidth
      } else hiddencolumns.push(col)
    }
    for (const col of keepcolumns) {
      (col as any).widthPercent = 100 * (col.width ?? defaultCellWidth) / used
    }
    state.set({ keepcolumns, hiddencolumns, lastcolumn: keepcolumns.length - 1 })
  }
  $: react(width, selectedkey)
  let menubuttonelement: HTMLElement
</script>

<style>
  table { width: 100%; }
  th {
    position: relative;
    box-sizing: border-box;
  }
  th :global([role="button"]) {
    cursor: pointer;
  }
  th.defaultIcon :global([role="button"]) {
    padding-right: 1.3em;
  }
  i {
    position: absolute;
    right: 0.4em;
    top: calc(50% - 0.08em);
    transform: translateY(-50%);
    border: solid black;
    border-width: 0 .2em .2em 0;
    padding: .15em;
  }
  .down { transform: translateY(-50%) rotate(45deg); }
</style>

<div bind:clientWidth={width}>
  <table class={tableClass}>
    <thead><tr class={headerRowClass}>
      {#each $state.keepcolumns as column, i}
        <th
          class={column.headerCellClass || headerCellClass}
          class:dropdowncol={i === $state.lastcolumn}
          class:defaultIcon={!headerButtonIconComponent}
        >
          <ConditionalWrapper
            bind:element={menubuttonelement}
            condition={i === $state.lastcolumn}
            role='button'
            tabindex={i === $state.lastcolumn ? 0 : undefined}
          >
            <ConditionalWrapper component={column.headerCellComponent} {column} title={column.title || column.key}>
              {#if i === $state.lastcolumn}
                {column.title || column.key}<ScreenReaderOnly>, click to choose another column</ScreenReaderOnly>
                {#if headerButtonIconComponent}
                  <svelte:component this={headerButtonIconComponent}></svelte:component>
                {:else}
                  <i aria-hidden="true" class="down"></i>
                {/if}
              {:else}
                {column.title || column.key}
              {/if}
            </ConditionalWrapper>
          </ConditionalWrapper>
        </th>
      {/each}
    </tr></thead>
    <tbody>
      {#each items as item, i (itemkeys[i])}
        <tr class={bodyRowClass}>
          {#each $state.keepcolumns as column}
            <td class={column.bodyCellClass || bodyCellClass}>
              {#if column.bodyCellComponent}
                <svelte:component this={column.bodyCellComponent} value={item[column.key]}>{item[column.key]}</svelte:component>
              {:else}
                {item[column.key]}
              {/if}
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
  </table>
</div>
<PopupMenu {menuClass} {menuItemClass} {menuItemHilitedClass} items={$menuitems} buttonelement={menubuttonelement} on:change={e => selectedkey = e.detail}></PopupMenu>
