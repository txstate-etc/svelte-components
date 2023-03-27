<!-- @component
  The purpose of `Lottie` is to provide a [Lottie](https://www.npmjs.com/package/lottie-web) player element
  with Screen Reader compatible attributes and lables readily available through the `alt` prop.
-->
<script lang="ts">
  import type { AnimationItem } from 'lottie-web/build/player/lottie_light'
  import { onMount } from 'svelte'
  import { isBlank } from 'txstate-utils'
  import ScreenReaderOnly from './ScreenReaderOnly.svelte'

  export let animationData: any
  export let loop = true
  export let name: string | undefined = undefined
  export let speed = 1
  export let direction: 1 | -1 = 1
  export let paused = false
  export let width: string | undefined = undefined
  export let height: string | undefined = undefined
  /** `<ScreenReaderOnly>` lable to be applied. */
  export let alt = ''

  let container: HTMLElement
  let animation: AnimationItem | undefined

  $: animation?.setSpeed(speed)
  $: animation?.setDirection(direction)
  $: paused ? animation?.pause() : animation?.play()

  onMount(async () => {
    const lottie = (await import('lottie-web/build/player/lottie_light')).default
    animation = lottie.loadAnimation({
      container,
      animationData,
      renderer: 'svg',
      loop,
      autoplay: !paused,
      name
    })
    animation.addEventListener('DOMLoaded', () => {
      animation.setSpeed(speed)
      animation.setDirection(direction)
    })
  })
</script>

<div bind:this={container} style:width style:height aria-hidden={isBlank(alt)}><ScreenReaderOnly>{alt}</ScreenReaderOnly></div>
