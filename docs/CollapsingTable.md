# Overview

This component is meant to help make tables responsive by eliminating columns (from the right) as the screen width reduces. When there are hidden columns, the last column header becomes a dropdown button allowing the selection of another column to be displayed instead.

# Usage

The only required prop is an `items` array of objects. Column headers will automatically be detected from object keys if no column configuration is present.

## Column Configuration

A `config` prop allows you to pass an array of column definitions. If passed, only these columns will appear, other keys in your `items` objects will be ignored.

### Variables accepted for each column

* `key: string` corresponds to object key in your `items` objects
* `title?: string` a display name for this column's header
* `width?: number` a guess at how wide in pixels this column will be; helps decide when to hide
                   columns, default 150
* `neverhide?: boolean`<br>
  setting to make sure this column is never hidden; good to set on
  the column that is most identifying for each row, like a name.
  by default the leftmost column will stick around as identifying
* `bodyCellClass?: string` CSS class to set on `td` elements in the body area
* `bodyCellComponent?: SvelteComponent`<br>
  A svelte component to place inside each `td` in the body area. Your component will receive
  `item`, `key`, and `value` as props. The value will also be placed inside your component's
  default slot as a bare string.
* `headerCellClass?: string` CSS class to set on `td` elements in the header row
* `headerCellComponent?: SvelteComponent`<br>
  A svelte component to place inside each `th` in the header row. Your component will receive
  `column`, `key`, and `title` as props, where `column` is this configuration object, and `title`
  is reliable (uses `key` if configuration had no `title`). The title/key will also be placed
  inside your component's default slot as a bare string.

## Optional Props
 * `tableClass` CSS class for the `table`
 * `bodyRowClass` CSS class for `tr` in the body area
 * `bodyCellClass` CSS class for `td` in the body area, additional to the one set in column config
 * `headerRowClass` CSS class for `tr` on the header row
 * `headerCellClass` CSS class for `th` in the header row, additional to the one set in column config
 * `menuClass` CSS class for the `ul` dropdown menu
 * `menuItemClass` CSS class for `li` in the dropdown menu
 * `menuItemHilitedClass` CSS class for `li` in the dropdown menu when they are currently hilited/active
 * `defaultCellWidth`, guess for any column width in pixels, allows you to hide columns earlier/later, default 150
