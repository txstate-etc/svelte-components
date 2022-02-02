# Conditional Wrapper
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

## Props
* `condition: boolean|undefined` (required) - Whether or not to wrap the element. Accepts `undefined`
  for convenience when evaluating presence of an optional variable.
* `component?: SvelteComponent` (optional) - The wrapper will be a svelte component instead of a DOM
  element. Props all get passed through.
* `a: boolean` (optional) - The wrapper will be a link element.
* `span: boolean` (optional) - The wrapper will be a span element.
* `element?: HTMLElement` (for binding) - If the wrapper is a DOM element, bind this prop to get a
  reference to wrapper element (if it exists). If the wrapper is a svelte component, this will be
  passed to it as a prop so that the wrapper component can bind it to a DOM element.

If none of `a`, `span`, or `component` props are specified, the default is to create a `div` wrapper.
