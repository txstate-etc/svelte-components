<script lang="ts">
  import { DeepStore } from '../lib'
  import { CollapsingTableColumn } from '../types'
  import { derived } from 'svelte/store'
  import PopupMenu from './PopupMenu.svelte'
  export let tableClass: string = ''
  export let bodyRowClass: string = ''
  export let bodyCellClass: string = ''
  export let headerRowClass: string = ''
  export let headerCellClass: string = ''
  export let menuClass: string = ''
  export let menuItemClass: string = ''
  export let menuItemHilitedClass: string = ''
  export let items: any[]
  export let config: CollapsingTableColumn[]|undefined = undefined
  let columns: CollapsingTableColumn[]
  let width: number = 320
  let selectedkey: string | undefined
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
  }
  $: reactToColumns(columns)

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
    let used = columns.filter(c => c.neverhide || c === selectedcol).reduce((sum, col) => sum + (col.width ?? 150), 0)
    for (const col of columns) {
      if (col.neverhide || col === selectedcol || used + (col.width ?? 150) < width) {
        keepcolumns.push(col)
        if (col !== selectedcol && !col.neverhide) used += col.width ?? 150
      } else hiddencolumns.push(col)
    }
    for (const col of keepcolumns) {
      (col as any).widthPercent = 100 * (col.width ?? 150) / used
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
  }
  th a {
    display: block;
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    text-decoration: none;
  }
</style>

<table class={tableClass} bind:clientWidth={width}>
  <thead><tr class={headerRowClass}>
    {#each $state.keepcolumns as column, i}
      <th class={column.headerCellClass || headerCellClass}>
        {#if column.headerCellComponent}
          <svelte:component this={column.headerCellComponent} {column} title={column.title || column.key}>
            {column.title || column.key}
          </svelte:component>
        {:else}
          {column.title || column.key}
        {/if}
        {#if i === $state.lastcolumn}
          <a href='#void' bind:this={menubuttonelement} aria-label={`showing ${column.title || column.key}, choose another column`}>&nbsp;</a>
        {/if}
      </th>
    {/each}
  </tr></thead>
  <tbody>
    {#each items as item}
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

<PopupMenu {menuClass} {menuItemClass} {menuItemHilitedClass} items={$menuitems} buttonelement={menubuttonelement} on:change={e => selectedkey = e.detail}></PopupMenu>
