<script lang="ts">
  import { Modal } from '$lib'
  let shown1 = false
  let shown2 = false
</script>

<div class="content">
  <button on:click={() => { shown1 = true }}>Show First Modal</button>
{#if shown1}
  <Modal on:escape={() => { shown1 = false }}>
    <div class="firstcontent">
      <button on:click={() => { shown2 = true }}>Show Second Modal</button>
      {#if shown2}
        <Modal on:escape={() => { shown2 = false }} >
          <form>
            <div class="formfield">
              <label for="firstname">First Name:</label><input id="firstname" type="text" name="firstname">
            </div>
            <div class="formfield">
              <label for="middlename">Middle Name:</label><input id="middlename" type="text" name="middlename">
            </div>
            <div class="formfield">
              <label for="lastname">Last Name:</label><input id="lastname" type="text" name="lastname">
            </div>
            <input type="submit" value="Submit" on:click={() => { shown2 = false }}>
          </form>
        </Modal>
      {/if}
    </div>
  </Modal>
{/if}
</div>

<style>
  form {
    background-color: white;
    padding: 10px;
    border-radius: 5px;
  }
  .content {
    font-size: 18px;
    line-height: 2;
  }
</style>
