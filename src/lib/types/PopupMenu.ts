/**  The basic information assocaited with individual choices that are presented in a PopupMenu. */
export interface PopupMenuDivider {
  divider: boolean
  groupName?: string
}

export interface PopupMenuItem {
  /** The value returned by the PopupMenu when the associated item is selected. */
  value: string
  /** An optional display string to show in the menu for the associated `value`. */
  label?: string
  /** Toggles the choice as one that's visible but is disabled and unclickable until conditions
   * are met that would cause it to become enabled. */
  disabled?: boolean
  /** An identifier string that keys into the `customCSS` component property to select a CSS
   * class set to associate with this PopupMenu item. Useful for associating custom formatting
   * of the individual PopupMenu items given to the PopupMenu for display. */
  cssKey?: string
  /** Some items might not be an actual option in the list of items displayed by the PopupMenu.
   * If you would like to clarify the role of the item to screen readers as different from the
   * default role of 'option' then set this property accordingly. */
  role?: string
}

export type PopupMenuTypes = (PopupMenuDivider | PopupMenuItem)
// export type PopupMenuTypes = (PopupMenuChoice | PopupMenuGroup)
