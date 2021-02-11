export function classes (...classNames: (string | undefined)[]) {
  return classNames.filter(Boolean).join(' ')
}
