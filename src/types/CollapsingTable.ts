export interface CollapsingTableColumn {
  key: string
  title?: string
  width?: number
  neverhide?: boolean
  bodyCellClass?: string
  bodyCellComponent?: Function
  headerCellClass?: string
  headerCellComponent?: Function
}
