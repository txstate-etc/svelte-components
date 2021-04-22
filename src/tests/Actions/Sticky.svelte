<script lang="ts">
  import { sticky } from '../../actions'
  import type { StickyStore } from '../../actions'
  import { DeepStore } from '../../lib';
  let target: HTMLElement
  let store = new DeepStore<StickyStore>({})
</script>

<div class='above'>above</div>
<table>
  <thead>
    <tr use:sticky><th>Name</th><th>Bedtime</th></tr>
  </thead>
  <tbody>
    <tr><td>Bobby</td><td>10pm</td></tr>
    <tr><td>Sue</td><td>3am</td></tr>
    <tr><td>Billy</td><td>11pm</td></tr>
    <tr><td>Mary</td><td>7pm</td></tr>
    <tr><td>Kevin</td><td>9:30pm</td></tr>
    <tr><td>Jess</td><td>12am</td></tr>
    <tr><td>Randy</td><td>1am</td></tr>
    <tr><td>Daniel</td><td>11pm</td></tr>
    <tr><td>Elizabetd</td><td>8pm</td></tr>
    <tr><td>Catderine</td><td>4pm</td></tr>
    <tr><td>Mandy</td><td>8:30pm</td></tr>
    <tr><td>Chris</td><td>9pm</td></tr>
    <tr><td>Sean</td><td>10:45pm</td></tr>
    <tr><td>Jack</td><td>2am</td></tr>
    <tr><td>Morgan</td><td>3pm</td></tr>
    <tr><td>Chuck</td><td>8pm</td></tr>
  </tbody>
</table>
<div class="extendedcontainer" bind:this={target}>
  <table>
    <thead use:sticky={{ target, store }}>
      <tr><th>Person</th><th>Calories</th><th>Fat</th><th>Protein</th></tr>
    </thead>
    <tbody>
      <tr><td>Mirna</td><td>1</td><td>28g</td><td>29g</td></tr>
      <tr><td>Fernando</td><td>38</td><td>2g</td><td>48g</td></tr>
      <tr><td>Lisette</td><td>18</td><td>9g</td><td>23g</td></tr>
      <tr><td>Ahmad</td><td>42</td><td>26g</td><td>49g</td></tr>
      <tr><td>Laquanda</td><td>27</td><td>27g</td><td>49g</td></tr>
    </tbody>
  </table>
  sticky header should continue to the bottom of this container
</div>
<div class='below'>below</div>

<style>
  .above { height: 400px; }
  .below { height: 1000px; }
  .extendedcontainer { padding-bottom: 50px; border: 1px solid black; }
  table {
    position: relative;
  }
  table th {
    background: lightgray;
  }
  th:first-child, td:first-child {
    width: 20em;
  }
  th:last-child, td:last-child {
    width: 8em;
  }
</style>
