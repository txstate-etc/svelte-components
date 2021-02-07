<script lang="ts">
  import CollapsingTable from '../../components/CollapsingTable.svelte'
  import { CollapsingTableColumn } from '../../types'
  import CollapsingTableTestContainer from './CollapsingTableTestContainer.svelte'
  const items = [
    { id: 1, name: 'John Smith', age: 42, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 },
    { id: 3, name: 'Mary Sue', age: 23, one: 1, two: 2, three: 3, four: 4, five: 5, six: 6 }
  ]
  const config: CollapsingTableColumn[] = [
    { key: 'id', neverhide: true },
    { key: 'name', neverhide: true },
    { key: 'age' },
    { key: 'one' },
    { key: 'two' },
    { key: 'three' },
    { key: 'four', bodyCellClass: 'four' },
    { key: 'five', bodyCellComponent: CollapsingTableTestContainer },
    { key: 'six' }
  ]
</script>

<CollapsingTable {items} {config}></CollapsingTable>
