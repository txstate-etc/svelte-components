/**
 * Turns any HTML element into an accessible button that responds to keyboard events and has
 * role="button" and the tabindex attribute set. You are still responsible for making sure it has
 * readable content or a good label.
 */
export function buttonify (node: HTMLElement) {
  function keydown (e: KeyboardEvent) {
    if (e.key === 'Enter') {
      if (!e.shiftKey && !e.metaKey && !e.ctrlKey && !e.altKey) {
        e.preventDefault()
        e.stopPropagation()
        node.dispatchEvent(new CustomEvent('click'))
      }
    }
  }

  node.addEventListener('keydown', keydown)
  if (node.tabIndex < 0) node.tabIndex = 0
  node.setAttribute('role', 'button')
  node.style.cursor = 'pointer'

  return {
    destroy () {
      node.removeEventListener('keydown', keydown)
    }
  }
}
