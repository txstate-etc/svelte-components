export function portal (el: HTMLElement, target: HTMLElement | null = document.body) {
  function update (target: HTMLElement | null = document.body) {
    target?.appendChild(el)
  }
  function destroy () {
    el.parentElement?.removeChild(el)
  }
  update(target)
  return {
    update,
    destroy
  }
}
