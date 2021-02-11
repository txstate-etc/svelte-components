<script lang="ts">
  import Modal from '../../components/Modal.svelte'
</script>

<Modal>
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
    <input type="submit" value="Submit">
  </form>
</Modal>

<style>
  form {
    background-color: white;
    padding: 10px;
    border-radius: 5px;
  }
</style>
