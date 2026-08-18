/**
 * elements that have no business in displayed rich text, matched by localName
 * so camelCase svg names cannot dodge a case-sensitive selector; svg itself is
 * allowed, but foreignObject can smuggle arbitrary html and the SMIL animation
 * elements can rewrite an href to javascript: at runtime, so they go; math goes
 * entirely as another classic smuggling vehicle
 */
const dangerousTags = new Set(['script', 'style', 'iframe', 'frame', 'frameset', 'object', 'embed', 'applet', 'link', 'meta', 'base', 'template', 'noscript', 'math', 'foreignobject', 'animate', 'animatetransform', 'animatemotion', 'set'])

/**
 * attributes removed no matter their value: forms may stay for display, but
 * they don't get to submit anywhere
 */
const strippedAttributes = ['action', 'formaction']

/** attributes that carry urls and could smuggle an executable scheme */
const urlAttributes = ['href', 'src', 'xlink:href', 'srcset']

function safeUrl (attr: string, value: string) {
  // browsers ignore control characters and whitespace inside a scheme, so
  // "jav\nascript:" still executes; normalize before testing
  const normalized = value.replace(/[\u0000-\u0020]/g, '').toLowerCase()
  if (/^(javascript|vbscript|data):/.test(normalized)) {
    // inline images are common and nothing executes in an img src data url
    return attr === 'src' && normalized.startsWith('data:image/')
  }
  return true
}

/**
 * Scrub a string of HTML so it can be displayed with reasonable confidence that
 * it will not execute anything. Parsing happens in the browser's own DOM - a
 * DOMParser document is inert, so nothing runs or loads during parsing - and
 * then we drop dangerous elements (script, style, iframe, and friends), inline
 * event handlers, and urls with executable schemes like `javascript:` (inline
 * `data:image` urls survive, since nothing executes in an img src). Forms are
 * kept for display but stripped of their action, and svg is kept minus its
 * smuggling compartments (foreignObject, SMIL animation elements).
 *
 * This is a strong net for displaying rich text, but it is intentionally
 * simpler than a real sanitizer like DOMPurify - prefer displaying content from
 * trusted sources and treat this as defense in depth, not permission to render
 * hostile input.
 *
 * In an environment with no DOMParser (i.e. during server-side rendering) this
 * returns an empty string rather than emit unvetted markup; render the original
 * on the client after mount/hydration instead.
 */
export function stripUnsafeHtml (html: string) {
  if (typeof DOMParser === 'undefined') return ''
  const doc = new DOMParser().parseFromString(html, 'text/html')
  for (const el of Array.from(doc.body.querySelectorAll('*'))) {
    if (dangerousTags.has(el.localName.toLowerCase())) { el.remove(); continue }
    for (const attr of Array.from(el.attributes)) {
      const name = attr.name.toLowerCase()
      if (name.startsWith('on') || strippedAttributes.includes(name) || (urlAttributes.includes(name) && !safeUrl(name, attr.value))) el.removeAttribute(attr.name)
    }
  }
  return doc.body.innerHTML
}
