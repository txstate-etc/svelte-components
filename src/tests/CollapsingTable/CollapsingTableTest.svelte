<script lang="ts">
  import CollapsingTable from '../../components/CollapsingTable.svelte'
  import { CollapsingTableColumn } from '../../types'
  const items = [
    { id: 1, name: 'John Smith', age: 42, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 },
    { id: 3, name: 'Mary Sue', age: 23, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }
  ]
  const config: CollapsingTableColumn[] = [
    { key: 'id' },
    { key: 'name', neverhide: true },
    { key: 'age' },
    { key: 'one' },
    { key: 'two' },
    { key: 'three' },
    { key: 'four', bodyCellClass: 'four' },
    { key: 'five' },
    { key: 'six' }
  ]
</script>

<CollapsingTable {items} {config} let:key let:value>
  {#if key === 'five'}
    <span class='test'>{value}</span>
  {:else}
    {value}
  {/if}
</CollapsingTable>
