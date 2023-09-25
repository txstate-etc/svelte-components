<script lang="ts">
  import { randomid } from 'txstate-utils'
  import { Store } from '@txstate-mws/svelte-store'
  import type { GlueAlignOpts, GlueAlignStore } from '$lib/actions'
  import type { PopupMenuTypes } from '$lib/types'
  import PopupMenu from './PopupMenu.svelte'

  export let buttonelement: HTMLButtonElement
  export let items: PopupMenuTypes[] = []
  export let menushown = false
  export let value: string|undefined = undefined
  export let align: GlueAlignOpts = 'auto'
  export let cover = false
  export let showSelected = true
  export let width:string|undefined = undefined
  export let computedalign = new Store<GlueAlignStore>({ valign: 'bottom', halign: 'left' })
  export let gap = 0
  export let adjustparentheight = false
  export let usePortal: HTMLElement|true|undefined = undefined
  export let loading = false
  export let hilited: number|undefined = undefined
  export let menuid = randomid()
  export let emptyText: string|undefined = undefined
  export let menuContainerClass = ''
  export let menuClass = ''
  export let menuItemClass = ''
  export let menuItemHilitedClass = ''
  export let menuItemSelectedClass = ''
  export let menuDividerClass = ''

  const usemenurole = true

</script>

<PopupMenu
  {usemenurole}
  {buttonelement}
  {items}
  {menushown}
  {value}
  {align}
  {cover}
  {showSelected}
  {width}
  {computedalign}
  {gap}
  {adjustparentheight}
  {usePortal}
  {loading}
  {hilited}
  {menuid}
  {emptyText}
  {menuContainerClass}
  {menuClass}
  {menuItemClass}
  {menuItemHilitedClass}
  {menuItemSelectedClass}
  {menuDividerClass}/>
