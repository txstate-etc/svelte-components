/**
 * Turns any HTML element into an accessible button that responds to keyboard events and has
 * role="button" and the tabindex attribute set. You are still responsible for making sure it has
 * readable content or a good label.
 */
export function button (node: HTMLElement) {
  function keydown (e: KeyboardEvent) {
    if (e.code === 'Enter' || e.code === 'Space') {
      if (!e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        e.stopPropagation()
        node.dispatchEvent(new CustomEvent('click'))
      }
    }
  }

  function click (e: MouseEvent|CustomEvent) {
    if (!(e instanceof CustomEvent)) {
      e.preventDefault()
      e.stopPropagation()
      node.dispatchEvent(new CustomEvent('click'))
    }
  }

  node.addEventListener('click', click)
  node.addEventListener('keydown', keydown)
  const saveindex = node.tabIndex
  if (node.tabIndex < 0) node.tabIndex = 0
  node.setAttribute('role', 'button')

  return {
    destroy () {
      node.removeEventListener('click', click)
      node.removeEventListener('keydown', keydown)
      node.removeAttribute('button')
      node.tabIndex = saveindex
    }
  }
}
