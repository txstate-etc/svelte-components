/**  The basic information assocaited with individual choices that are presented in a PopupMenu. */
export interface PopupMenuItem {
  /** The value returned by the PopupMenu when the associated item is selected. */
  value: string
  /** An optional display string to show in the menu for the associated `value`. */
  label?: string
  /** Toggles the choice as one that's visible but is disabled and unclickable until conditions
   * are met that would cause it to become enabled. */
  disabled?: boolean
}

/** A PopupMenu list native type for displaying */
export interface PopupMenuDivider {
  /** Toggle for whether this instance of this type is shown. */
  divider: boolean
  /** Optional labeling to display. Useful for dividers used as group headers.
   * We may want to update PopupMenu to use <optgroup lable=
   */
  label?: string
}

/** To support ARIA best practices for groups within listboxes as popup menus
 * we'll need to group options under sub-lists. This interface provides a means
 * for passing such to PopupMenu.
 * @note Not currently in use. */
export interface PopupMenuGroup {
  /** The label for the group. */
  lable: string
  /** The listing of options that would be listed under the parent `<ul>`. */
  options: PopupMenuTypes[]
}

export type PopupMenuTypes = (PopupMenuDivider | PopupMenuItem)
