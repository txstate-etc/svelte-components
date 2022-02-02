export type ElementOffsets = Partial<ReturnType<typeof bodyOffset>>

export function bodyOffset (ele: HTMLElement) {
  return targetOffset(ele, document.body)
}

export function targetOffset (ele: HTMLElement, target: HTMLElement) {
  const offset = targetOffsetRecursive(ele, target)
  return {
    ...offset,
    right: target.offsetWidth - offset.left - ele.offsetWidth,
    bottom: target.offsetHeight - offset.top - ele.offsetHeight
  }
}

export function sharedOffsetParent (a: HTMLElement, b: HTMLElement) {
  if (!a || !b) return undefined
  if (a.contains(b) && (a.firstElementChild as HTMLElement).offsetParent === a) return a
  if (b.contains(a) && (b.firstElementChild as HTMLElement).offsetParent === b) return b
  let c = a.offsetParent as HTMLElement
  while (c instanceof HTMLElement && !c.contains(b)) c = c.offsetParent as HTMLElement
  return c
}

function targetOffsetRecursive (ele: HTMLElement, target: HTMLElement, currentOffset?: { top: number, left: number }): { top: number, left: number } {
  const { x, y } = getTranslate(ele)
  const offset = {
    top: ele.offsetTop + (currentOffset?.top ?? 0) + y,
    left: ele.offsetLeft + (currentOffset?.left ?? 0) + x
  }
  if (ele.offsetParent instanceof HTMLElement && target !== ele.offsetParent && target.contains(ele.offsetParent)) return targetOffsetRecursive(ele.offsetParent, target, offset)
  return offset
}

function getTranslate (element: HTMLElement) {
  const style = window.getComputedStyle(element)
  const matrix = style.transform

  // No transform property. Simply return 0 values.
  if (matrix === 'none' || !matrix) {
    return {
      x: 0,
      y: 0,
      z: 0
    }
  }

  // Can either be 2d or 3d transform
  const matrixType = matrix.includes('3d') ? '3d' : '2d'
  const matrixValues = matrix.match(/matrix.*\((.+)\)/)![1].split(', ')

  // 2d matrices have 6 values
  // Last 2 values are X and Y.
  // 2d matrices does not have Z value.
  if (matrixType === '2d') {
    return {
      x: Number(matrixValues[4]),
      y: Number(matrixValues[5]),
      z: 0
    }
  }

  // 3d matrices have 16 values
  // The 13th, 14th, and 15th values are X, Y, and Z
  if (matrixType === '3d') {
    return {
      x: Number(matrixValues[12]),
      y: Number(matrixValues[13]),
      z: Number(matrixValues[14])
    }
  }
  return {
    x: 0,
    y: 0,
    z: 0
  }
}
