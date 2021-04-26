export function bodyOffset (ele: HTMLElement) {
  const offset = bodyOffsetRecursive(ele)
  return {
    ...offset,
    right: document.body.offsetWidth - offset.left - ele.offsetWidth,
    bottom: document.body.offsetHeight - offset.top - ele.offsetHeight
  }
}

function bodyOffsetRecursive (ele: HTMLElement, currentOffset?: { top: number, left: number }): { top: number, left: number } {
  const { x, y } = getTranslate(ele)
  const offset = {
    top: ele.offsetTop + (currentOffset?.top ?? 0) + y,
    left: ele.offsetLeft + (currentOffset?.left ?? 0) + x
  }
  if (ele.offsetParent instanceof HTMLElement && ele.offsetParent !== document.body) return bodyOffsetRecursive(ele.offsetParent, offset)
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
