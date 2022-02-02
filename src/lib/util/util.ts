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
