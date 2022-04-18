<script lang="ts">
  import { MultiSelect } from '$lib'
  import { sleep } from 'txstate-utils'
  let firstid
  let secondid
  function getOptionsFirst (val: string) {
    return ['apple', 'orange', 'banana'].filter(o => o.includes(val)).map(value => ({ value }))
  }

  const secondItems = [
    { value: 'apple', label: 'Apple' },
    { value: 'orange', label: 'Orange' },
    { value: 'banana', label: 'Banana' }
  ]
  async function getOptionsSecond (val: string) {
    if (!val) return secondItems
    await sleep(400)
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

</script>

<label for={firstid}>Fruit with only values</label><br>
<MultiSelect bind:id={firstid} name="test1" selected={[{ value: 'apple', label: 'apple' }]} getOptions={getOptionsFirst} />

<label for={secondid}>Fruit with value and label</label><br>
<MultiSelect bind:id={secondid} name="test2" selected={[{ value: 'orange', label: 'Orange' }, { value: 'banana', label: 'Banana' }]} placeholder='Choose some fruit' getOptions={getOptionsSecond} />

<label for={secondid}>Disabled cars with value and label</label><br>
<MultiSelect bind:id={secondid} name="test3" disabled selected={[{ value: 'honda', label: 'Honda' }, { value: 'kia', label: 'Kia' }]} placeholder='Choose some cars' getOptions={getOptionsThird} />
