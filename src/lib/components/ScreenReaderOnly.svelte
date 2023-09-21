<!-- @component
  This component is for adding text that can be read by screen readers while remaining invisible to regular users.
  Useful for when aria-label isn't supported with the drawback that it can show up in copy/paste selections.
-->
<script lang="ts">
  /** An id to bind with the `<span>` used to implement this component. */
  export let id: string | undefined = undefined
  export let arialive: 'off' | 'assertive' | 'polite' | undefined = undefined
  export let ariaatomic: boolean | 'false' | 'true' | undefined = undefined
</script>

<style>
  .sr-only {
    border: 0 !important;
    clip: rect(1px, 1px, 1px, 1px) !important;
    -webkit-clip-path: inset(50%) !important;
      clip-path: inset(50%) !important;
    height: 1px !important;
    margin: -1px !important;
    overflow: hidden !important;
    padding: 0 !important;
    position: absolute !important;
    width: 1px !important;
    white-space: nowrap !important;
    font-size: 20px !important;
    background: white !important;
    color: black !important;
  }
</style>

<span {id} class="sr-only" aria-live={arialive} aria-atomic={ariaatomic}><slot/></span>
