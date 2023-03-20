import { toArray } from 'txstate-utils'

export interface SvelteActionReturnType<P> {
  update?: (newParams: P) => void
  destroy?: () => void
}

export type SvelteHTMLActionType<P = any> = (
  node: HTMLElement,
  params?: P
) => SvelteActionReturnType<P> | undefined

export type HTMLActionEntry<P = any> =
  | SvelteHTMLActionType<P>
  | [SvelteHTMLActionType<P>, P]

export type SvelteSVGActionType<P = any> = (
  node: SVGElement,
  params?: P
) => SvelteActionReturnType<P> | undefined

export type SVGActionEntry<P = any> =
  | SvelteSVGActionType<P>
  | [SvelteSVGActionType<P>, P]

export function passActions (node: HTMLElement, actions: HTMLActionEntry[]): SvelteActionReturnType<HTMLActionEntry[]>
export function passActions (node: SVGElement, actions: SVGActionEntry[]): SvelteActionReturnType<SVGActionEntry[]>
export function passActions (
  node: HTMLElement & SVGElement,
  actions: HTMLActionEntry[] | SVGActionEntry[]
) {
  let actionReturns = new Map<HTMLActionEntry | SVGActionEntry, SvelteActionReturnType<any> | undefined>()

  for (const actionEntry of actions ?? []) {
    const [action, params] = toArray(actionEntry)
    actionReturns.set(action, action(node, params))
  }

  return {
    update (actions: HTMLActionEntry[] | SVGActionEntry[]) {
      const newActionReturns = new Map<HTMLActionEntry | SVGActionEntry, SvelteActionReturnType<any> | undefined>()

      // accept new actions and update actions we already had
      for (const actionEntry of actions ?? []) {
        const [action, params] = toArray(actionEntry)
        if (actionReturns.has(action)) {
          const existing = actionReturns.get(action)
          newActionReturns.set(action, existing)
          existing?.update?.(params)
        } else {
          newActionReturns.set(action, action(node, params))
        }
      }

      // destroy any actions that were removed
      for (const [action, actionReturn] of actionReturns.entries()) {
        if (!newActionReturns.has(action)) actionReturn?.destroy?.()
      }

      actionReturns = newActionReturns
    },

    destroy () {
      for (const actionReturn of actionReturns.values()) {
        actionReturn?.destroy?.()
      }
    }
  }
}
