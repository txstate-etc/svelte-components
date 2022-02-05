import type { SettableSubject } from '@txstate-mws/svelte-store'
export const CARDLAYOUT = {}
export interface Block {
  element: HTMLElement
  order?: SettableSubject<number>
  linebreak?: SettableSubject<boolean>
  width?: SettableSubject<string>
  height?: number
}
export interface CardLayoutContext {
  registerBlock: (block: Block) => Block
  recalculate: () => void
  gutter: SettableSubject<number>
}
