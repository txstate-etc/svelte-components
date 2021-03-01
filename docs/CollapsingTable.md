# Collapsing Table

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
  `item`, `key`, and `value` as props. The value will also be placed inside your component's
  default slot as a bare string.
* `headerCellClass?: string` CSS class to set on `td` elements in the header row
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

## Slots
Lots of slots are provided for extra configuration.

### Default Slot
The default slot is used for each table cell in the body area. Because of the way slots work, your
content will always be executed in every cell. So if you need to do something special for just one
cell, you have to use an if/else block to identify the special cell, falling back to {value} for
everything else:
```svelte
<CollapsingTable items={myItems} let:key let:value>
  {#if key === 'myspecialkey'}
    <MySpecialComponent>{value}</MySpecialComponent>
  {:else}
    {value}
  {/if}
</CollapsingTable>
```
### Header Cell Slot
A slot named `headercell` allows you to do the same thing for cells in the header row that the
default slot allows for body cells.
```svelte
<CollapsingTable items={myItems} let:key let:title>
  <div slot="headercell">
    {#if key === 'myspecialkey'}
      <MySpecialComponent>{title}</MySpecialComponent>
    {:else}
      {title}
    {/if}
  </div>
</CollapsingTable>
```
### Dropdown Icon Slot
A slot is provided for you to provide a custom icon for the column header that is serving as the
dropdown button.
```svelte
<CollapsingTable items={myItems} let:key let:value>
  <i type='fa caret-down' slot="dropicon" aria-hidden="true"></i>
</CollapsingTable>
```
