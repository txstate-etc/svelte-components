<script lang="ts">
    import { onMount } from 'svelte';
  import PopupMenuComplex from '../../../test/PopupMenuComplex.svelte'
  const items = [
    { value: '0', label: 'Sunday', disabled: true },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday', disabled: true },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday', disabled: true },
    { value: '7', label: 'Sunday', disabled: true },
    { value: '8', label: 'Monday' },
    { value: '9', label: 'Tuesday' },
    { value: '10', label: 'Wednesday' },
    { value: '11', label: 'Thursday', disabled: true },
    { value: '12', label: 'Friday' },
    { value: '13', label: 'Saturday', disabled: true },
    { value: '14', label: 'Sunday', disabled: true },
    { value: '15', label: 'Monday' },
    { value: '16', label: 'Tuesday' },
    { value: '17', label: 'Wednesday' },
    { value: '18', label: 'Thursday', disabled: true },
    { value: '19', label: 'Friday' },
    { value: '20', label: 'Saturday', disabled: true }
  ]
  onMount(() => {
    document.querySelector('.scrollable button')?.scrollIntoView({
      block: 'center'
    })
  })
</script>

<div class="scrollable">
  <div class="scrollable-content">
    <PopupMenuComplex {items}></PopupMenuComplex>
  </div>
</div>

<style>
  .scrollable {
    height: 200px;
    overflow: auto;
    border: 1px solid black;
    position: relative;
  }
  .scrollable-content {
    height: 600px;
    padding-top: 280px;
  }
</style>
