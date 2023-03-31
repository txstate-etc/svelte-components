<script lang="ts">
  import { MultiSelect } from '$lib'
  import { sleep } from 'txstate-utils'
  let firstid
  let secondid
  let fourthid
  let longid
  
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

  const thirdItems = [
    { value: 'honda', label: 'Honda' },
    { value: 'dodge', label: 'Dodge' },
    { value: 'hyundai', label: 'Hyundai' },
    { value: 'kia', label: 'Kia' }
  ]
  async function getOptionsThird (val: string) {
    if (!val) return thirdItems
    return thirdItems.filter(o => o.value.includes(val.toLocaleLowerCase()))
  }

  async function getOptionsFourth (val: string) {
    if (!val) return secondItems
    return thirdItems.filter(o => o.value.includes(val.toLocaleLowerCase()))
  }

  const longNamedItems = [
    { value: '1', label: 'Long-Named_ItemNumber: One' },
    { value: '2', label: 'LongNamed-Item_Number - Two' },
    { value: '3', label: 'Long.Named.Item.Number: Three' },
    { value: '4', label: 'Long.Named-Item.Number - Four' },
    { value: '5', label: 'Long.Named-Item.Number - Five' },
    { value: '6', label: 'Long.Named-Item.Number - Six' },
    { value: '7', label: 'Long.Named-Item.Number - Seven - and some additional labeling for extra length' }
  ]
  async function getOptionsLong (val: string) {
    if (!val) return longNamedItems
    return longNamedItems.filter(c => c.label.toLocaleLowerCase().includes(val.toLocaleLowerCase()))
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

<label for={fourthid}>Select a fruit or type/select a car</label><br>
<MultiSelect bind:id={firstid} name="test4" selected={[secondItems[0]]} getOptions={getOptionsFourth} />

<label for={longid}>Select multiple items with long names and adjust page width</label><br>
<MultiSelect bind:id={longid} name="testlong" selected={[longNamedItems[0], longNamedItems[2], longNamedItems[4]]} getOptions={getOptionsLong} />
