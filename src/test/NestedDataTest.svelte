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
    ],
    extrareturns: `hi
    there`,
    lorem: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vestibulum in mattis purus, lacinia dapibus urna. Integer in lectus nec quam posuere tristique nec non arcu. Morbi lacinia congue dolor at congue. Pellentesque accumsan id odio id malesuada. Etiam mollis, enim quis bibendum iaculis, diam massa gravida dui, vel tincidunt lorem tellus vitae orci. Vivamus facilisis arcu et arcu condimentum, non ullamcorper lorem bibendum. Sed eu elit metus. Maecenas at viverra ligula. Sed finibus, lorem non gravida suscipit, dolor massa tempor dui, id rhoncus dui felis eget turpis. Vivamus lacinia erat eget metus fringilla bibendum.

Cras ut tincidunt est. Nam tempor consequat suscipit. Fusce magna metus, porttitor ut leo at, dignissim mattis quam. Mauris efficitur orci arcu. In vestibulum nunc justo, ut faucibus ligula sollicitudin eu. Suspendisse porta accumsan lorem, non placerat magna ultrices ac. Mauris et turpis imperdiet, ultricies lorem eu, ornare enim. Maecenas porta lectus eget urna aliquet pretium. Vestibulum velit nisl, porttitor sit amet lectus et, cursus egestas neque. Etiam id erat et urna aliquam luctus. Proin viverra tristique faucibus. Sed pulvinar ante elit, ut semper est egestas in. Duis dignissim posuere tristique.`
  }

  const htmlData = {
    // canaries: the script sets a global, the style would hide the list item, and the
    // href/onerror/iframe would each execute or embed; tests prove none survived,
    // while the svg keeps drawing (minus its smuggling compartments) and the form
    // keeps displaying (minus its action)
    body: '<p>Hello <strong>world</strong></p>\n<ul><li>a list inside the html</li></ul>\n<p>Second paragraph</p>\n<script>window.hacked = true\x3C/script>\n<style>#html li { display: none }</style>\n<p><a href="https://example.edu/archives">good link</a> <a href="javascript:window.hacked = true">evil link</a></p>\n<img src="https://broken.invalid/x" alt="broken" onerror="window.hacked = true">\n<iframe src="https://example.edu" title="frame"></iframe>\n<svg onload="window.hacked = true" width="24" height="24"><circle cx="12" cy="12" r="10" fill="#501214"></circle><foreignObject><div>smuggled html</div></foreignObject></svg>\n<form action="https://example.edu/subscribe" method="post"><button type="button">Subscribe</button></form>',
    long: Array.from({ length: 12 }, (_, i) => `<p>Paragraph ${i + 1} of a long rich text document.</p>`).join('\n'),
    plain: 'no tags here'
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

<h2>long text untruncated</h2>
<div id="longform">
  <NestedData data={{ lorem: data.lorem }} maxtext={5000} />
</div>

<h2>allowHtml on and off</h2>
<div id="html">
  <NestedData data={htmlData} allowHtml />
</div>
<div id="htmloff">
  <NestedData data={htmlData} />
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
