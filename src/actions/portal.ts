export function portal (el: HTMLElement, target: HTMLElement|null = document.body) {
  function update (target: HTMLElement|null = document.body) {
    if (!target) return
    target.appendChild(el)
    el.hidden = false
  }
  function destroy () {
    if (el.parentElement) {
      el.parentElement.removeChild(el)
    }
  }
  update(target)
  return {
    update,
    destroy
  }
}
