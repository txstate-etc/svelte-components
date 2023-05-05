<script lang="ts">
  import { MultiSelect, type PopupMenuItem } from '$lib'
  import { sleep } from 'txstate-utils'
  let firstid
  let secondid
  let hybridid
  let longid
  let lotsofid

  function getOptionsFirst (val: string) {
    return ['apple', 'orange', 'banana'].filter(o => o.includes(val)).map(value => ({ value }))
  }

  const secondItems = [
    { value: 'apple', label: 'Apple' },
    { value: 'orange', label: 'Orange' },
    { value: 'banana', label: 'Banana' }
  ]
  async function getOptionsSecond (val: string) {
    await sleep(400)
    if (!val) return secondItems
    return secondItems.filter(o => o.value.includes(val.toLocaleLowerCase()))
  }

  const thirdItems: PopupMenuItem[] = [
    { value: 'honda', label: 'Honda' },
    { value: 'dodge', label: 'Dodge' },
    { value: 'hyundai', label: 'Hyundai' },
    { value: 'kia', label: 'Kia' }
  ]
  async function getOptionsThird (val: string) {
    if (!val) return thirdItems
    return thirdItems.filter(o => o.value.includes(val.toLocaleLowerCase()))
  }


  /* ------------------------------------------------------------------------------------------
   * Demo of combining multiple lists with styling to create a quick options MultiSelect with choice groupings.
   * ------------------------------------------------------------------------------------------ */
  const commonHeader = { divider: true, groupName: 'Commmon Options' }
  const carsHeader = { divider: true, groupName: 'Vehicle Makes' }
  // const deferredCue = { label: '…', value: '', disabled: true }
  const customCSS: Map<string, string[]> = new Map([
    ['itemHeader', ['multiselect-group-header']],
    ['itemChoice', ['multiselect-choice']],
    ['inputClass', ['multiselect-input']]
  ])
  const commonItems = [
    commonHeader,
    { value: 'compact', label: 'Compact', cssKey: 'itemChoice' },
    { value: 'truck', label: 'Truck', cssKey: 'itemChoice' },
    { value: 'atv', label: 'ATV', cssKey: 'itemChoice' },
    { value: 'other', label: 'Other Transportation', cssKey: 'itemChoice' }
  ]
  const carItems = [carsHeader, ...thirdItems.map(c => { return { ...c, cssKey: 'itemChoice' } })]
  let selectedHybrid = []
  $: selectedHybridSet = new Set(selectedHybrid.map(s => s.value))
  $: carOptionsAvailable = carItems.filter(o => 'value' in o && !selectedHybridSet.has(o.value)).length > 1
  $: commonOptionsAvailable = commonItems.filter(o => 'value' in o && !selectedHybridSet.has(o.value)).length > 1
  $: placeholderHybrid = carOptionsAvailable
    ? commonOptionsAvailable
      ? 'Select a common choice or autocomplete for makes...'
      : 'Autocomplete for car makes...'
    : commonOptionsAvailable
      ? 'Select from available common choices...'
      : 'All options selected.'

  async function getOptionsHybrid (val: string) {
    if (!val) {
      return commonItems
    }
    return [...commonItems, ...carItems].filter(o => 'divider' in o || o.value.includes(val.toLocaleLowerCase()))
  }
  // ------------------------------------------------------------------------------------------

  const longNamedItems = [
    { value: '1', label: 'Long-Named_ItemNumber: One' },
    { value: '2', label: 'LongNamed-Item_Number - Two' },
    { value: '3', label: 'Long.Named.Item.Number: Three' },
    { value: '4', label: 'Long.Named-Item.Number - Four' },
    { value: '5', label: 'Long.Named-Item.Number - Five' },
    { value: '6', label: 'Long.Named-Item.Number - Six' },
    { value: '7', label: 'Long.Named-Item.Number - Seven - and some additional labeling for extra length' },
    { value: '8', label: '123456789-123456789-123456789-123456789-123456789-123456789-123456789-123456789-' }
  ]
  async function getOptionsLong (val: string) {
    if (!val) return longNamedItems
    return longNamedItems.filter(c => c.label.toLocaleLowerCase().includes(val.toLocaleLowerCase()))
  }

  const lotsOfItems = [{ value: '0', label: 'Item: 0' }]
  for (let i = 1; i < 151; i++) {
    lotsOfItems.push({ value: `${i}`, label: `Item: ${i}` })
  }
  async function getOptionsLots (val: string) {
    if (!val) return lotsOfItems
    return lotsOfItems.filter(c => c.label.toLocaleLowerCase().includes(val.toLocaleLowerCase()))
  }
</script>


<label for={firstid}>Fruit with only values</label><br>
<MultiSelect bind:id={firstid} name="test1" selected={[secondItems[0]]} getOptions={getOptionsFirst} />

<label for={secondid}>Fruit with value and label</label><br>
<MultiSelect bind:id={secondid} name="test2" selected={[secondItems[1], secondItems[2]]} placeholder='Choose some fruit' getOptions={getOptionsSecond} />

<label for={secondid}>Disabled cars with value and label</label><br>
<MultiSelect bind:id={secondid} name="test3" disabled selected={[thirdItems[0], thirdItems[3]]} placeholder='Choose some cars' getOptions={getOptionsThird} />

<label for={firstid}>Select a single fruit</label><br>
<MultiSelect bind:id={firstid} name="test1" maxSelections={1} selected={[secondItems[0]]} getOptions={getOptionsFirst} />

<label for={firstid}>Select up to two fruits</label><br>
<MultiSelect bind:id={firstid} name="test1" maxSelections={2} selected={[secondItems[0]]} getOptions={getOptionsFirst} />

<label for={hybridid}>Select a common option or type/select a car model - with group headers and styling</label><br>
<MultiSelect bind:id={hybridid} name="testhybrid" bind:selected={selectedHybrid} bind:placeholder={placeholderHybrid}
 getOptions={getOptionsHybrid} {customCSS}
/>

<label for={longid}>Select multiple items with long names and adjust page width</label><br>
<MultiSelect bind:id={longid} name="testlong" selected={[longNamedItems[0], longNamedItems[2], longNamedItems[4]]} getOptions={getOptionsLong} />

<label for={longid}>Multiselect with slotted element and inputClass modification passed to it</label><br>
<MultiSelect bind:id={longid} name="testlong" selected={[longNamedItems[0], longNamedItems[2]]} inputClass='multiselect-input' getOptions={getOptionsLong}>
  <div>Some slotted element.</div>
</MultiSelect>

<label for={lotsofid}>Multiselect with lots of items to list</label><br>
<MultiSelect bind:id={lotsofid} name="testlots" selected={[lotsOfItems[0], lotsOfItems[2]]}  getOptions={getOptionsLots} />

<style>
  :global(.multiselect-input) {
    width: 100%
  }
  :global(.multiselect-group-header) {
    transform: translateX(-2%)
  }
  :global(.multiselect-choice) {
    transform: translateX(5%)
  }
</style>
