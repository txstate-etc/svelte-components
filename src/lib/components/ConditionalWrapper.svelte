<script lang="ts">
  export let condition: boolean|undefined
  export let component: Function|undefined = undefined
  export let a = false
  export let span = false
  export let element: HTMLElement|undefined = undefined
  $: passthrough = (({ condition, component, a, span, element, ...passthrough }) => passthrough)($$props)
</script>

{#if condition || (typeof condition === 'undefined' && component)}
  {#if component}
    <svelte:component this={component} bind:element {...passthrough}><slot></slot></svelte:component>
  {:else}
    {#if a}
      <!-- svelte-ignore a11y-missing-attribute -->
      <a bind:this={element} {...passthrough}><slot></slot></a>
    {:else if span}
      <span bind:this={element} {...passthrough}><slot></slot></span>
    {:else}
      <div bind:this={element} {...passthrough}><slot></slot></div>
    {/if}
  {/if}
{:else}
  <slot></slot>
{/if}
