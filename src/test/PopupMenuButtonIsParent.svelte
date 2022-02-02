<script lang="ts">
  import { buttonify, PopupMenu } from '$lib'
  let button: HTMLElement

  export let items = [
    { value: '0', label: 'Sunday', disabled: true },
    { value: '1', label: 'Monday' },
    { value: '2', label: 'Tuesday' },
    { value: '3', label: 'Wednesday' },
    { value: '4', label: 'Thursday', disabled: true },
    { value: '5', label: 'Friday' },
    { value: '6', label: 'Saturday', disabled: true }
  ]
</script>

<div class="topspacer"></div>
<div class="container">
  <div class="ui gold button" use:buttonify bind:this={button}>
    Popup Menu
    <PopupMenu buttonelement={button} {items}></PopupMenu>
  </div>
</div>

<style>
  .topspacer {
    height: 20px;
  }
  .container {
    margin-left: 12px;
  }
  .button {
    position: relative;
    margin-left: 12px;
    width: 210px;
  }
</style>
