export function classes (...classNames: (string | undefined)[]) {
  return classNames.filter(Boolean).join(' ')
}

export function debounced (fn: Function, timeout: number) {
  let timer: NodeJS.Timeout
  return (...args: any[]) => {
    clearTimeout(timer)
    timer = setTimeout(() => fn(...args), timeout)
  }
}

export function debouncedPromise <T> (fn: (..._: any) => Promise<T>|T, timeout: number, defaultValue: T): (..._: any) => Promise<T> {
  let version = 0
  return async (...args: any[]) => {
    const myversion = ++version
    return await new Promise(resolve => {
      setTimeout(() => {
        if (version === myversion) {
          version = 0
          resolve(fn(...args))
        } else {
          resolve(defaultValue)
        }
      }, timeout)
    })
  }
}

export function modifierKey (e) {
  return e.ctrlKey || e.altKey || e.metaKey || e.key === 'Insert'
}

export function selectionIsLeft (ele: HTMLInputElement|HTMLTextAreaElement) {
  return ele.selectionStart === 0 && ele.selectionEnd === 0
}
