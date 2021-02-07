export function bodyOffset (ele: HTMLElement) {
  const offset = bodyOffsetRecursive(ele)
  return {
    ...offset,
    right: document.body.offsetWidth - offset.left - ele.offsetWidth,
    bottom: document.body.offsetHeight - offset.top - ele.offsetHeight
  }
}

function bodyOffsetRecursive (ele: HTMLElement, currentOffset?: { top: number, left: number }): { top: number, left: number } {
  const offset = {
    top: ele.offsetTop + (currentOffset?.top ?? 0),
    left: ele.offsetLeft + (currentOffset?.left ?? 0)
  }
  if (ele.offsetParent instanceof HTMLElement && ele.offsetParent !== document.body) return bodyOffsetRecursive(ele.offsetParent, offset)
  return offset
}
