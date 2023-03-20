export function classes (...classNames: (string | undefined)[]) {
  return classNames.filter(Boolean).join(' ')
}

export function debounced (fn: (..._: any[]) => any, timeout: number) {
  let timer: NodeJS.Timeout
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
