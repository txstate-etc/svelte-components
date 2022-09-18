<script lang="ts">
  export let className = ''
  import { getContext } from 'svelte'
  import { resize, passActions, type HTMLActionEntry, type SvelteHTMLActionType } from '$lib/actions'
  import { CARDLAYOUT } from '$lib/types'
  import type { CardLayoutContext, Block } from '$lib/types'

  export let use: HTMLActionEntry[] = []

  const block: Block = { element: undefined }
  const { registerBlock, gutter, recalculate } = getContext<CardLayoutContext>(CARDLAYOUT)
  const { width, order, linebreak } = registerBlock(block)
</script>

<li class="cardlayout-card {className}" bind:this={block.element} use:passActions={use} use:resize on:resize={recalculate} style="margin-bottom: {$gutter}px; width: {$width}; order: {$order};">
  <slot></slot>
</li>
{#if $linebreak}
  <li aria-hidden="true" class="cardlayout-columnbreak" style:order={$order}></li>
{/if}

<style>
  .cardlayout-columnbreak {
    width: 0;
    height: 100%;
    visibility: hidden;
  }
</style>
