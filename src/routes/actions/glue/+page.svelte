<script lang="ts">
  import GlueContainingBlock from '../../../test/GlueContainingBlock.svelte'
</script>
<div class="grid">
  <div><GlueContainingBlock id="transform" containerstyle="transform: translateX(0)"></GlueContainingBlock></div>
  <div><GlueContainingBlock id="containertype" containerstyle="container-type: inline-size"></GlueContainingBlock></div>
  <div><GlueContainingBlock id="containmulti" containerstyle="contain: style layout"></GlueContainingBlock></div>
  <div><GlueContainingBlock id="willchangemulti" containerstyle="will-change: opacity, transform"></GlueContainingBlock></div>
</div>

<style>
  .grid {
    display: grid;
    grid-template-columns: repeat(2, max-content);
    gap: 1em;
  }
</style>
