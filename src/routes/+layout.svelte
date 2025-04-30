<script lang="ts">
  import { page } from '$app/stores'
  import './layout.css'
  interface Link {
    label: string
    href: string
    subtitle?: string
    sublinks?: Link[]
    selected?: boolean
    parent?: boolean
  }
  let links: Link[] = [
    { label: 'Home', href: '/', subtitle: 'Overview of everything svelte-components provides.' },
    {
      label: 'Actions',
      href: '/actions',
      subtitle: 'A generic component for presenting a dropdown menu.',
      sublinks: [
        { label: 'offset', href: '/actions/offset' },
        { label: 'offset debounced', href: '/actions/offsetdebounce' },
        { label: 'resize', href: '/actions/resize' },
        { label: 'resize debounced', href: '/actions/resizedebounce' },
        { label: 'sticky', href: '/actions/sticky' },
        { label: 'element queries', href: '/actions/elementqueries' }
      ]
    },
    {
      label: 'Modal',
      href: '/modal',
      subtitle: 'A component for accessible modal dialogs.',
      sublinks: [
        { label: 'double modal', href: '/modal/double' }
      ]
    },
    {
      label: 'PopupMenu',
      href: '/popupmenu',
      subtitle: 'A generic component for presenting a dropdown menu.',
      sublinks: [
        { label: 'show selected', href: '/popupmenu/showselected' },
        { label: 'complex placement', href: '/popupmenu/complex' },
        { label: 'body placement', href: '/popupmenu/body' },
        { label: 'button is parent', href: '/popupmenu/parent' },
        { label: 'scrollable', href: '/popupmenu/scrollable' },
        { label: 'insidescrolldiv', href: '/popupmenu/insidescrolldiv' },
        { label: 'no items', href: '/popupmenu/empty' },
        { label: 'ButtonMenu', href: '/popupmenu/buttonmenu' },
        { label: 'transform test', href: '/popupmenu/transform' },
        { label: 'grouped items test', href: '/popupmenu/categories' }
      ]
    },
    {
      label: 'CollapsingTable',
      href: '/collapsingtable',
      subtitle: 'A table that hides columns on small screens and introduces a dropdown to show one at a time.',
      sublinks: [
        { label: 'sticky header', href: '/collapsingtable/stickyheader' }
      ]
    },
    {
      label: 'Cards',
      href: '/cards',
      subtitle: 'Components for generating a pinterest-style card layout.',
      sublinks: [
        { label: 'preserve order', href: '/cards/preserve' }
      ]
    },
    { label: 'MultiSelect', href: '/multiselect', subtitle: 'A component for selecting multiple items from a list.' },
    { label: 'Lottie', href: '/lottie', subtitle: 'A component for loading lottie animations.' }
  ]
  $: current = links.find(l => l.href === '/' ? $page.url.pathname === '/' : $page.url.pathname.startsWith(l.href))
  $: title = current?.label
  $: subtitle = current?.subtitle

  function isSelected (link: Link) {
    return $page.url.pathname === link.href && link.href !== '/'
  }

  function isParentOfSelected (link: Link) {
    return !isSelected(link) && link.href !== '/' && $page.url.pathname.startsWith(link.href)
  }

  function updateLinks (links: Link[], ..._: any) {
    if (!links) return []
    return links.map(l => ({ ...l, selected: isSelected(l), parent: isParentOfSelected(l), sublinks: l.sublinks ? updateLinks(l.sublinks) : undefined }))
  }
  $: links = updateLinks(links, $page)

  let active = false
  function onClick () {
    active = !active
  }
</script>

<div id="layout" class:active>
  <!-- Menu toggle -->
  <button id="menuLink" class="menu-link" on:click={onClick}>
    <!-- Hamburger icon -->
    <span></span>
  </button>

  <div id="menu">
    <div class="pure-menu">
      <ul class="pure-menu-list">
        {#each links as link}
          <li class="pure-menu-item pure-menu-parent" class:pure-menu-selected={link.selected} class:pure-menu-subselected={link.parent}>
            <a href="{link.href}" class="pure-menu-link">{link.label}</a>
          </li>
          {#if link.sublinks?.length && (link.selected || link.parent)}
            <ul class="pure-menu-list">
              {#each link.sublinks as sublink}
                <li class="pure-menu-item" class:pure-menu-selected={sublink.selected}>
                  <a href="{sublink.href}" class="pure-menu-link">{sublink.label}</a>
                </li>
              {/each}
            </ul>
          {/if}
        {/each}
      </ul>
    </div>
  </div>

  <div id="main">
    <div class="header">
      <h1>{title}</h1>
      {#if subtitle}<h2>{subtitle}</h2>{/if}
    </div>

    <div class="content">
      <slot />
    </div>
  </div>
</div>
