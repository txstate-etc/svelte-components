<script lang="ts">
  import { Modal } from '$lib'
  let current: 'none' | 'a' | 'b' = 'none'
</script>

<div class="content">
  <button id="open-a" on:click={() => { current = 'a' }}>Open Modal A</button>
{#if current === 'a'}
  <Modal on:escape={() => { current = 'none' }}>
    <div class="dialog">
      <button id="replace" on:click={() => { current = 'b' }}>Replace with Modal B</button>
    </div>
  </Modal>
{:else if current === 'b'}
  <Modal on:escape={() => { current = 'none' }}>
    <form class="dialog">
      <div class="formfield">
        <label for="title">Title:</label><input id="title" type="text" name="title">
      </div>
      <input type="submit" value="Submit" on:click={() => { current = 'none' }}>
    </form>
  </Modal>
{/if}
</div>

<style>
  .dialog {
    background-color: white;
    padding: 10px;
    border-radius: 5px;
  }
</style>
