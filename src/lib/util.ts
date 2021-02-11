export function classes (...classNames: (string | undefined)[]) {
  return classNames.filter(Boolean).join(' ')
}

export function debounced (cb: Function, timeout: number) {
  let timer: number
  return () => {
    clearTimeout(timer)
    timer = setTimeout(cb, timeout)
  }
}
