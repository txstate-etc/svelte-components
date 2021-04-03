<script lang="ts">
  import { DeepStore, classes } from '../lib'
  import type { CollapsingTableColumn } from '../types'
  import { derived } from 'svelte/store'
  import DefaultPopupMenu from './PopupMenu.svelte'
  import ScreenReaderOnly from './ScreenReaderOnly.svelte'
  export let tableClass = ''
  export let bodyRowClass = ''
  export let bodyCellClass = ''
  export let headerRowClass = ''
  export let headerCellClass = ''
  export let menuContainerClass = ''
  export let menuClass = ''
  export let menuItemClass = ''
  export let menuItemHilitedClass = ''
  export let items: any[]
  export let config: CollapsingTableColumn[]|undefined = undefined
  export let defaultCellWidth = 150
  export let PopupMenu = DefaultPopupMenu
  let columns: CollapsingTableColumn[]
  let width: number = 320
  let selectedkey: string | undefined
  let identifyingkeys: string[] = []
  $: firstrow = items?.[0] ?? {}
  $: columns = config ?? Object.keys(firstrow).map(key => ({ key }))
  function reactToColumns (columns: CollapsingTableColumn[]) {
    if (!columns.some(c => c.neverhide)) {
      columns[0].neverhide = true
    }
    const sortedcolumns = columns // stable sort
      .map((c, i) => ({ col: c, idx: i}))
      .sort((a, b) => ((a.col.neverhide ? 0 : 1) - (b.col.neverhide ? 0 : 1)) || a.idx - b.idx)
      .map(o => o.col)
    if (!selectedkey) selectedkey = sortedcolumns.find(c => !c.neverhide)?.key
    identifyingkeys = sortedcolumns.filter(c => c.neverhide).map(c => c.key)
    return sortedcolumns
  }
  $: sortedcolumns = reactToColumns(columns)

  $: itemkeys = items.map(item => item.id ?? item._id ?? identifyingkeys.map(k => item[k]).join('.'))

  const state = new DeepStore({
    keepcolumns: [] as (CollapsingTableColumn & { widthPercent?: number })[],
    hiddencolumns: [] as CollapsingTableColumn[],
    dropdowncolumn: undefined as (CollapsingTableColumn & { widthPercent?: number }) | undefined
  })
  const menuitems = derived(state, obj => obj.hiddencolumns.map(c => ({ value: c.key, label: c.title })))
  function react (width: number, selectedkey?: string) {
    const selectedcol = sortedcolumns.find(c => c.key === selectedkey) ?? columns[1]
    const keepcolumns: CollapsingTableColumn[] = []
    const hiddencolumns: CollapsingTableColumn[] = []
    let used = sortedcolumns.filter(c => c.neverhide || c === selectedcol).reduce((sum, col) => sum + (col.width ?? defaultCellWidth), 0)
    for (const col of sortedcolumns) {
      if (col.neverhide || col === selectedcol || used + (col.width ?? defaultCellWidth) < width) {
        keepcolumns.push(col)
        if (col !== selectedcol && !col.neverhide) used += col.width ?? defaultCellWidth
      } else hiddencolumns.push(col)
    }
    for (const col of keepcolumns) {
      (col as any).widthPercent = 100 * (col.width ?? defaultCellWidth) / used
    }
    const dropdowncolumn = hiddencolumns.length ? keepcolumns[keepcolumns.length - 1] : undefined
    state.set({ keepcolumns, hiddencolumns, dropdowncolumn })
  }
  $: react(width, selectedkey)
  let headers: HTMLElement[] = []
  $: menubuttonelement = headers[$state.keepcolumns.length - 1]
</script>

<style>
  table { width: 100%; }
  th {
    position: relative;
    box-sizing: border-box;
  }
  th[role="button"] {
    cursor: pointer !important;
  }
  th.defaultIcon :global([role="button"]) {
    padding-right: 1.3em;
  }
  i {
    position: absolute;
    right: 0.4em;
    top: calc(50% - 0.08em);
    transform: translateY(-50%) rotate(45deg);
    border: solid black;
    border-width: 0 .2em .2em 0;
    padding: .15em;
  }
</style>

<div bind:clientWidth={width}>
  <table class={tableClass}>
    <thead><tr class={headerRowClass}>
      {#each $state.keepcolumns as column, i (column.key)}
        <th
          class={classes(column.headerCellClass, headerCellClass)}
          class:defaultIcon={$state.dropdowncolumn === column && !$$slots.dropicon && $state.dropdowncolumn}
          bind:this={headers[i]}
          role={$state.dropdowncolumn === column ? 'button' : undefined }
          tabindex={$state.dropdowncolumn === column ? 0 : undefined }
        >
          <slot name="headercell" {column} key={column.key} title={column.title || column.key} item={undefined} value={undefined}>
            {column.title || column.key}
          </slot>
          {#if $state.dropdowncolumn === column}
            <ScreenReaderOnly>, click to choose another column to show</ScreenReaderOnly>
            <slot name="dropicon" {column} item={undefined} value={undefined}>
              <i aria-hidden="true"></i>
            </slot>
          {/if}
        </th>
      {/each}
    </tr></thead>
    <tbody>
      {#each items as item, i (itemkeys[i])}
        <tr class={bodyRowClass}>
          {#each $state.keepcolumns as column (column.key)}
            <td class={classes(column.bodyCellClass, bodyCellClass)}>
              <slot key={column.key} value={item[column.key]} {item}>
                {item[column.key]}
              </slot>
            </td>
          {/each}
        </tr>
      {/each}
    </tbody>
    {#if $$slots.footer}<tfoot><slot name="footer" item={undefined} key={undefined} value={undefined}></slot></tfoot>{/if}
  </table>
</div>
<PopupMenu {menuContainerClass} {menuClass} {menuItemClass} {menuItemHilitedClass} items={$menuitems} buttonelement={menubuttonelement} on:change={e => selectedkey = e.detail}></PopupMenu>
