<script lang="ts">
  import { MultiSelect, type PopupMenuItem } from '$lib'
  import { sleep } from 'txstate-utils'
  let firstid
  let secondid
  let thirdid
  let fourthid
  let fifthid
  let hybridid
  let longid
  let longslotid
  let lotsofid
  let groupeditemsid

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
    { value: 'honda', label: 'Honda', group: 'Vehicle Makes' },
    { value: 'dodge', label: 'Dodge', group: 'Vehicle Makes' },
    { value: 'hyundai', label: 'Hyundai', group: 'Vehicle Makes' },
    { value: 'kia', label: 'Kia', group: 'Vehicle Makes' }
  ]
  async function getOptionsThird (val: string) {
    if (!val) return thirdItems
    return thirdItems.filter(o => o.value.includes(val.toLocaleLowerCase()))
  }


  /* ------------------------------------------------------------------------------------------
   * Demo of combining multiple lists with styling to create a quick options MultiSelect with choice groupings.
   * ------------------------------------------------------------------------------------------ */
  const commonItems = [
    { value: 'compact', label: 'Compact', group: 'Common Options' },
    { value: 'truck', label: 'Truck', group: 'Common Options' },
    { value: 'atv', label: 'ATV', group: 'Common Options' },
    { value: 'other', label: 'Other Transportation', group: 'Common Options' }
  ]
  const carItems = thirdItems
  let selectedHybrid: PopupMenuItem[] = []
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

  const rocks: PopupMenuItem[] = [
    { value: 'granite', label: 'Granite', group: 'Igneous' },
    { value: 'gabbro', label: 'Gabbro', group: 'Igneous' },
    { value: 'pumice', label: 'Pumice', group: 'Igneous' },
    { value: 'obsidian', label: 'Obsidian', group: 'Igneous' },
    { value: 'limestone', label: 'Limestone', group: 'Sedimentary' },
    { value: 'shale', label: 'Shale', group: 'Sedimentary' },
    { value: 'sandstone', label: 'Sandstone', group: 'Sedimentary' },
    { value: 'marble', label: 'Marble', group: 'Metamorphic' },
    { value: 'gneiss', label: 'Gneiss', group: 'Metamorphic' }
  ]

  async function getCategorizedOptions (val: string) {
    if (!val) return rocks
    return rocks.filter(o => o.value.includes(val.toLocaleLowerCase()) || o.group?.toLocaleLowerCase().includes(val.toLocaleLowerCase()))
  }

  function categorizedOptionLabel (item: PopupMenuItem) {
    const tag = item.label ?? item.value
    return item.group ? `${item.group}: ${tag}` : tag
  }
</script>


<label for={firstid}>Fruit with only values</label><br>
<MultiSelect bind:id={firstid} name="test1" selected={[{ value: 'apple' }]} getOptions={getOptionsFirst} />

<label for={secondid}>Fruit with value and label</label><br>
<MultiSelect bind:id={secondid} name="test2" selected={[secondItems[1], secondItems[2]]} placeholder='Choose some fruit' getOptions={getOptionsSecond} />

<label for={thirdid}>Disabled cars with value and label</label><br>
<MultiSelect bind:id={thirdid} name="test3" disabled selected={[thirdItems[0], thirdItems[3]]} placeholder='Choose some cars' getOptions={getOptionsThird} />

<label for={fourthid}>Select a single fruit</label><br>
<MultiSelect bind:id={fourthid} name="test4" maxSelections={1} selected={[{ value: 'apple' }]} getOptions={getOptionsFirst} />

<label for={fifthid}>Select up to two fruits</label><br>
<MultiSelect bind:id={fifthid} name="test5" maxSelections={2} selected={[{ value: 'apple' }]} getOptions={getOptionsFirst} />

<label for={hybridid}>Select a common option or type/select a car model - with group headers and styling</label><br>
<MultiSelect bind:id={hybridid} name="testhybrid" bind:selected={selectedHybrid} bind:placeholder={placeholderHybrid}
 getOptions={getOptionsHybrid} menuCategoryClass='multiselect-dividers'
/>

<label for={longid}>Select multiple items with long names and adjust page width</label><br>
<MultiSelect bind:id={longid} name="testlong" selected={[longNamedItems[0], longNamedItems[2], longNamedItems[4]]} getOptions={getOptionsLong} />

<label for={longslotid}>Multiselect with slotted element and inputClass modification passed to it</label><br>
<MultiSelect bind:id={longslotid} name="testslotted" selected={[longNamedItems[0], longNamedItems[2]]} inputClass='multiselect-input' getOptions={getOptionsLong}>
  <div>Some slotted element.</div>
</MultiSelect>

<label for={lotsofid}>Multiselect with lots of items to list</label><br>
<MultiSelect bind:id={lotsofid} name="testlots" selected={[lotsOfItems[0], lotsOfItems[2]]} getOptions={getOptionsLots} />

<label for={groupeditemsid}>Multiselect with Categorized Items</label><br>
<MultiSelect bind:id={groupeditemsid} name="testcategories" getOptions={getCategorizedOptions} includeDeleteAll confirmDelete="Are you sure you want to remove all selected rocks?" selectedItemLabel={categorizedOptionLabel}/>

<style>
  :global(.multiselect) {
    margin-bottom: 1em;
  }
  :global(.multiselect-input) {
    width: 100%
  }
  :global(.multiselect-dividers) {
    background-color: #EEEEEE;
  }
  :global(.content) {
    padding-bottom: 400px;
  }
</style>
