<!-- @component
[Conditional Wrapper](https://github.com/txstate-etc/svelte-components/blob/main/docs/ConditionalWrapper.md)
Sometimes you want to wrap a complex bit of HTML in a certain element based on a condition,
and not wrap it at all if the condition isn't met. Without help, this situation results in a
lot of duplicate code because you have to have an if/else block outside the whole thing, and
the complex HTML goes in both branches:
```svelte
{#if shouldwrap}
  <div class="wrapper">
    ... a whole bunch of html ...
  </div>
{:else}
  ... a whole bunch of html, again ...
{/if}
```
With this component, you can de-duplicate like this:
```svelte
<ConditionalWrapper class="wrapper" condition={shouldwrap}>
  ... a whole bunch of html ...
</ConditionalWrapper>
```
Any props you provide (except the ConditionalWrapper props like `condition`) will pass through
to the wrapper element/component, if it gets inserted.
-->
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
