<!-- @component
[Collapsing Table](https://github.com/txstate-etc/svelte-components/blob/main/docs/CollapsingTable.md)

This component is meant to help make tables responsive by eliminating columns (from the right) as the screen width reduces.
When there are hidden columns, the last column header becomes a dropdown button allowing the selection of another column
to be displayed instead.
-->
<script lang="ts">
  import { Store } from '@txstate-mws/svelte-store'
  import { derived } from 'svelte/store'
  import type { CollapsingTableColumn, PopupMenuItem } from '$lib/types'
  import { classes } from '$lib/util'
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
  export let config: CollapsingTableColumn[] | undefined = undefined
  export let defaultCellWidth = 150
  export let PopupMenu = DefaultPopupMenu
  export let slots: Record<string, boolean> = $$slots
  export let stickyheader: boolean = false
  let columns: CollapsingTableColumn[]
  let width: number = 320
  let selected: PopupMenuItem | undefined
  let identifyingkeys: string[] = []
  $: firstrow = items?.[0] ?? {}
  $: columns = config ?? Object.keys(firstrow as object).map(key => ({ key }))
  function reactToColumns (columns: CollapsingTableColumn[]) {
    if (!columns.some(c => c.neverhide)) {
      columns[0].neverhide = true
    }
    const sortedcolumns = columns // stable sort
      .map((c, i) => ({ col: c, idx: i }))
      .sort((a, b) => ((a.col.neverhide ? 0 : 1) - (b.col.neverhide ? 0 : 1)) || a.idx - b.idx)
      .map(o => o.col)
    if (!selected) {
      const firstcol = sortedcolumns.find(c => !c.neverhide)
      selected = firstcol ? { value: firstcol.key } : undefined
    }
    identifyingkeys = sortedcolumns.filter(c => c.neverhide).map(c => c.key)
    return sortedcolumns
  }
  $: sortedcolumns = reactToColumns(columns)

  $: itemkeys = items.map(item => item.id ?? item._id ?? identifyingkeys.map(k => item[k]).join('.'))

  const state = new Store({
    keepcolumns: [] as (CollapsingTableColumn & { widthPercent?: number })[],
    hiddencolumns: [] as CollapsingTableColumn[],
    dropdowncolumn: undefined as (CollapsingTableColumn & { widthPercent?: number }) | undefined
  })
  const menuitems = derived(state, obj => obj.hiddencolumns.map(c => ({ value: c.key, label: c.title })))
  function react (..._: any[]) {
    const selectedcol = sortedcolumns.find(c => c.key === selected?.value) ?? columns[1]
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
  $: react(width, selected)
  const headers: HTMLElement[] = []
  $: menubuttonelement = headers[$state.keepcolumns.length - 1]
</script>

<div bind:clientWidth={width}>
  <table class={tableClass}>
    <thead class:stickyheader><tr class={headerRowClass}>
      {#each $state.keepcolumns as column, i (column.key)}
        <th
          class={classes(column.headerCellClass, headerCellClass)}
          class:defaultIcon={!slots.dropicon && $state.dropdowncolumn === column}
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
    {#if slots.footer}<tfoot><slot name="footer" item={undefined} key={undefined} value={undefined}></slot></tfoot>{/if}
  </table>
</div>
{#if $menuitems.length > 0}
  <svelte:component this={PopupMenu} {menuContainerClass} {menuClass} {menuItemClass} {menuItemHilitedClass} items={$menuitems} buttonelement={menubuttonelement} on:change={e => { selected = e.detail }}></svelte:component>
{/if}

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
  th.defaultIcon :global(i) {
    transform: translateY(-50%) rotate(45deg);
    border: solid black;
    border-width: 0 .2em .2em 0;
    padding: .15em;
  }
  th :global(i) {
    position: absolute;
    right: 0.4em;
    top: calc(50% - 0.08em);
  }
  .stickyheader th {
    position: sticky;
    top: 0;
    z-index: 1;
  }
</style>
