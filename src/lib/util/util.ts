export function classes (...classNames: (string | undefined)[]) {
  return classNames.filter(Boolean).join(' ')
}

export function debounced (fn: (..._: any[]) => any, timeout: number) {
  let timer: number
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), timeout)
  }
}

export function modifierKey (e) {
  return e.ctrlKey || e.altKey || e.metaKey || e.key === 'Insert'
}

export function selectionIsLeft (ele: HTMLInputElement | HTMLTextAreaElement) {
  return ele.selectionStart === 0 && ele.selectionEnd === 0
}

export function getScrollParents (element: HTMLElement) {
  let style = getComputedStyle(element)
  const excludeStaticParent = style.position === 'absolute'
  if (style.position === 'fixed') return [document.body]
  for (let parent: HTMLElement | null = element; (parent = parent.parentElement);) {
    style = getComputedStyle(parent)
    if (excludeStaticParent && style.position === 'static') {
      continue
    }
    if (/(auto|scroll|hidden)/.test(style.overflow + style.overflowY + style.overflowX)) return [parent, ...getScrollParents(parent)]
  }
  return [document.body]
}
