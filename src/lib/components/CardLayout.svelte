<script lang="ts">
  import { onDestroy, tick, setContext, onMount } from 'svelte'
  import { writable } from 'svelte/store'
  import { browser } from '$app/env'
  import { ElementSize, resize } from '$lib/actions'
  import { CARDLAYOUT } from '$lib/types'
  import type { Block } from '$lib/types'
  export let maxwidth = 500
  export let preserveorder = false
  export let gutter = 10
  export let className = ''
  const blocks = []
  const gutterstore = writable(gutter)
  let defaultOrder = 0
  setContext(CARDLAYOUT, {
    registerBlock: (block: Block) => {
      blocks.push(block)
      hardrecalc()
      onDestroy(() => {
        blocks.splice(blocks.indexOf(block), 1)
        hardrecalc()
      })
      block.order = writable(defaultOrder++)
      block.linebreak = writable(false)
      const cols = savecolumns || Math.ceil(1024 / maxwidth)
      block.width = writable(`calc(${100.0 / cols}% - ${gutter * (cols - 1) / cols}px)`)
      return block
    },
    recalculate: () => {
      hardrecalc()
    },
    gutter: gutterstore
  })
  $: gutterstore.set(gutter)
  let layoutelement: HTMLElement
  let cycle1 = 0
  let cycle2 = 0
  function detectcycle (w: number) {
    if (cycle1 === 0 && Math.abs(w - cycle2) > 5) {
      cycle1 = w
    } else if (cycle2 === 0 && Math.abs(w - cycle1) > 5) {
      cycle2 = w
    } else if (w === cycle1 || w === cycle2) {
      return true
    } else {
      cycle1 = 0
      cycle2 = 0
    }
    return false
  }
  let savecolumns = 0
  let optimal: Block[][]
  let fullheight = 0
  let hardrequired = false
  async function recalculate (realw: number) {
    const columns = Math.ceil(realw / maxwidth)
    const guttereach = gutter * (columns - 1) / columns
    const cycling = detectcycle(realw)
    if (columns !== savecolumns) {
      for (const block of blocks) block.width.set(`calc(${100.0 / columns}% - ${guttereach}px`)
      await tick()
    }
    // collect all the card heights at this new column width
    for (const block of blocks) block.height = block.element?.offsetHeight ?? 200
    if (columns !== savecolumns || hardrequired) { // only do real work if number of columns has changed, recalculate triggers on resize
      if (preserveorder) {
        optimal = [blocks]
        if (columns > 1) {
          const totalheight = blocks.reduce((totalheight, block) => totalheight + block.height + gutter, 0)
          const tallestblock = Math.max(...blocks.map(b => b.height))
          const minheight = Math.max(totalheight / columns, tallestblock)
          let shortestoverall = totalheight
          // 2d packing problem is NP-hard so this is an O(n) heuristic
          // optimal configuration would be if each column is `minheight` so start there
          // then relax it in increments and see if the overall height shrinks
          const increment = Math.max(1, Math.floor(Math.min(minheight, tallestblock) * 0.05))
          for (let colmaxheight = minheight; colmaxheight < minheight + tallestblock + gutter; colmaxheight += increment) {
            let colheight = 0
            let colidx = 0
            let tallestcol = 0
            let tallestcolidx = 0
            const arrangement = []
            for (const block of blocks) {
              if (colheight + block.height > colmaxheight && colidx < columns - 1) {
                if (colheight > tallestcol) {
                  tallestcol = colheight
                  tallestcolidx = colidx
                }
                colidx++
                colheight = 0
              }
              if (!arrangement[colidx]) arrangement[colidx] = []
              arrangement[colidx].push(block)
              colheight += block.height + gutter
            }
            if (colheight > tallestcol) {
              tallestcol = colheight
              tallestcolidx = colidx
            }
            if (tallestcol < shortestoverall) {
              shortestoverall = tallestcol
              optimal = arrangement
            }
            // if leftmost column is tallest, increasing the allowable height can never make the overall height shorter
            if (tallestcolidx === 0) break
          }
        }
      } else {
        optimal = []
        const heights: number[] = Array.apply(null, Array(columns)).map((_: any) => 0) // initializes heights to an array of zeroes
        // begin sorting blocks into columns
        for (const block of blocks) {
          // find the column with the smallest current height
          const colidx = heights.reduce((acc, curr, curridx) => curr < heights[acc] ? curridx : acc, 0)
          // record the height we are adding to the chosen column
          heights[colidx] += block.height + gutter
          // move the current card to the chosen column
          if (!optimal[colidx]) optimal[colidx] = []
          optimal[colidx].push(block)
        }
      }
      // we created the optimal arrangement, now move the block elements to
      // reflect it
      let order = 0
      for (let i = 0; i < optimal.length; i++) {
        for (let j = 0; j < optimal[i].length; j++) {
          const block = optimal[i][j]
          block.order.set(order++)
          block.linebreak.set(j === optimal[i].length - 1 && i < optimal.length - 1)
        }
      }
      savecolumns = columns
      hardrequired = false
    }
    // re-adjust container height
    const saveheight = fullheight
    fullheight = 0
    for (let i = 0; i < optimal.length; i++) {
      let top = 0
      for (const block of optimal[i]) {
        top += block.height + gutter
      }
      fullheight = Math.max(fullheight, top)
    }
    if (cycling && saveheight < fullheight) fullheight = saveheight
  }

  let savewidth = 0
  let timer = 0
  function triggerrecalc (width: number) {
    if (width === savewidth && !hardrequired) return
    cancelAnimationFrame(timer)
    timer = requestAnimationFrame(() => {
      recalculate(width)
      savewidth = width
    })
  }
  function hardrecalc () {
    if (!layoutelement) return
    hardrequired = true
    cycle1 = 0
    cycle2 = 0
    triggerrecalc(layoutelement.clientWidth)
  }
  function onResize (e: UIEvent & { currentTarget: any, detail: ElementSize }) {
    triggerrecalc(e.detail.clientWidth)
  }
  onMount(() => triggerrecalc(layoutelement.clientWidth))
</script>

<ul class="cardlayout {className}" class:ssr={!browser} style:height={browser ? `${fullheight + gutter}px` : undefined} bind:this={layoutelement} use:resize on:resize={onResize}>
  <slot></slot>
</ul>

<style>
  .cardlayout {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    flex-wrap: wrap;
    flex-direction: column;
    align-content: space-between;
  }
  .cardlayout.ssr {
    flex-direction: row;
  }
</style>
