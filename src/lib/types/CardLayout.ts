import type { UsableSubject } from '@txstate-mws/svelte-store'
export const CARDLAYOUT = {}
export interface Block {
  element: HTMLElement
  order?: UsableSubject<number>
  linebreak?: UsableSubject<boolean>
  width?: UsableSubject<number>
  height?: number
}
export interface CardLayoutContext {
  registerBlock: (block: Block) => Block
  recalculate: () => void
  gutter: UsableSubject<number>
}
