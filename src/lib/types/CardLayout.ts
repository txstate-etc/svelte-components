import type { SettableSubject } from '@txstate-mws/svelte-store'
export const CARDLAYOUT = {}
/**
```ts
{ element:    HTMLElement
   order?:     SettableSubject<number>
   linebreak?: SettableSubject<boolean>
   width?:     SettableSubject<string>
   height?:    number
}
``` */
export interface Block {
  element: HTMLElement | undefined
  order?: SettableSubject<number>
  linebreak?: SettableSubject<boolean>
  width?: SettableSubject<string>
  height?: number
}
/**
```ts
{ registerBlock: (block: Block) => Block
   recalculate:   () => void
   gutter:        SettableSubject<number>
}
``` */
export interface CardLayoutContext {
  registerBlock: (block: Block) => Block
  recalculate: () => void
  gutter: SettableSubject<number>
}
