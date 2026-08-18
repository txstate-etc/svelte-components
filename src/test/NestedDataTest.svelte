<script lang="ts">
  import NestedData from '$lib/components/NestedData.svelte'

  const data = {
    title: 'Campus History',
    updatedAt: '2026-03-04T15:30:00Z',
    archivedAt: new Date('2026-06-01T12:00:00Z'),
    established: '1899-05-10',
    visitors: 1042,
    tags: new Set(['history', 'campus']),
    translations: new Map<any, any>([['en', 'Campus History'], ['es', 'Historia del Campus']]),
    skippedMap: new Map<any, any>([[{ complex: 'key' }, 'never shown']]),
    sections: [
      {
        heading: 'Founding',
        subsections: [
          { id: 5, name: 'An Item', citations: [{ url: 'https://example.edu/archives' }] }
        ]
      }
    ]
  }

  const cyclic: any = { name: 'loop' }
  cyclic.self = cyclic

  const priced = { price: 42.5, note: 'plain' }
  function currency (value: string, path: (string | number)[]) {
    if (path[path.length - 1] === 'price') return `$${value}`
    return undefined
  }
</script>

<h2>default rendering</h2>
<div id="default">
  <NestedData {data} />
</div>

<h2>cyclic data</h2>
<div id="cyclic">
  <NestedData data={cyclic} />
</div>

<h2>custom format and elided placeholder</h2>
<div id="formatted">
  <NestedData data={priced} format={currency} />
</div>
<div id="shallow">
  <NestedData {data} maxlevel={1} elidedObjectText="(object)" elidedArrayText="(list)" elidedTooltip="too deep" />
</div>
