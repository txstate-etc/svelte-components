import { test, expect } from '@playwright/test'
import { dateToISOWithTZ } from 'txstate-utils'

// the browser inherits the test machine's timezone, so we can compute the
// expected local rendering with the same utility the component uses
const localize = iso => dateToISOWithTZ(new Date(iso)).replace('.000', '')

test.beforeEach(async ({ page }) => {
  await page.goto('/nesteddata')
})

test('renders objects as key/value rows and arrays as bulleted lists', async ({ page }) => {
  const root = page.locator('#default')
  await expect(root.locator('dt', { hasText: 'title:' })).toHaveCount(1)
  await expect(root.locator('text=Founding')).toHaveCount(1)
  await expect(root.locator('text=An Item')).toHaveCount(1)
})

test('datetimes render as ISO8601 in the browser timezone, date-only strings pass through', async ({ page }) => {
  const root = page.locator('#default')
  await expect(root.locator(`text=${localize('2026-03-04T15:30:00Z')}`)).toHaveCount(1)
  await expect(root.locator(`text=${localize('2026-06-01T12:00:00Z')}`)).toHaveCount(1)
  await expect(root.locator('text=1899-05-10')).toHaveCount(1)
})

test('Sets render like arrays, Maps with stringable keys like objects, others are skipped', async ({ page }) => {
  const root = page.locator('#default')
  await expect(root.locator('li', { hasText: 'history' })).toHaveCount(1)
  await expect(root.locator('dt', { hasText: 'es:' })).toHaveCount(1)
  await expect(root.locator('text=Historia del Campus')).toHaveCount(1)
  // the map with a non-stringable key renders nothing, but its own key remains
  await expect(root.locator('dt', { hasText: 'skippedMap:' })).toHaveCount(1)
  await expect(root.locator('text=never shown')).toHaveCount(0)

  // a container value always drops below its key, even a small one
  const transDt = await root.locator('dt', { hasText: 'translations:' }).boundingBox()
  const transDd = await root.locator('dt', { hasText: 'translations:' }).locator('..').locator('dd').first().boundingBox()
  expect(transDd.y).toBeGreaterThan(transDt.y + 5)
})

test('data nested past maxlevel elides with a placeholder distinguishing arrays from objects', async ({ page }) => {
  // citations sits inside a level-4 object, past the default maxlevel of 5
  const root = page.locator('#default')
  await expect(root.locator('dt', { hasText: 'citations:' })).toHaveCount(1)
  await expect(root.locator('.nested-data-elided')).toHaveText('[...]')
  await expect(root.locator('text=example.edu/archives')).toHaveCount(0)

  // custom placeholders: tags (a Set) elides with the array text, translations
  // (a Map) with the object text
  const shallow = page.locator('#shallow')
  await expect(shallow.locator('.nested-data-elided').first()).toHaveText('(list)')
  await expect(shallow.locator('.nested-data-elided').first()).toHaveAttribute('title', 'too deep')
  await expect(shallow.locator('dt', { hasText: 'translations:' }).locator('..').locator('.nested-data-elided')).toHaveText('(object)')
  await expect(shallow.locator('text=Founding')).toHaveCount(0)
})

test('long text truncates at maxtext, preserves line breaks, and drops below its key indented', async ({ page }) => {
  // default maxtext of 200: cut off with an ellipsis
  const truncated = await page.locator('#default dt', { hasText: 'lorem:' }).locator('..').locator('.nested-data-scalar').textContent()
  expect(truncated.length).toBeLessThanOrEqual(201)
  expect(truncated.endsWith('…')).toBe(true)

  // untruncated: both paragraphs present, blank line preserved via pre-line
  const longform = page.locator('#longform .nested-data-scalar')
  await expect(longform).toContainText('Cras ut tincidunt est')
  await expect(longform).toHaveCSS('white-space', 'pre-line')

  // the long value drops below its key while a short value stays beside its key
  const loremDt = await page.locator('#longform dt', { hasText: 'lorem:' }).boundingBox()
  const loremDd = await page.locator('#longform dd').boundingBox()
  expect(loremDd.y).toBeGreaterThan(loremDt.y + 5)
  expect(loremDd.x).toBeGreaterThan(loremDt.x + 2)
  const titleDt = await page.locator('#default dt', { hasText: 'title:' }).boundingBox()
  const titleDd = await page.locator('#default dd').first().boundingBox()
  expect(Math.abs(titleDd.y - titleDt.y)).toBeLessThan(5)

  // a short value with embedded line breaks also drops below its key
  const extraDt = await page.locator('#default dt', { hasText: 'extrareturns:' }).boundingBox()
  const extraDd = await page.locator('#default dt', { hasText: 'extrareturns:' }).locator('..').locator('dd').boundingBox()
  expect(extraDd.y).toBeGreaterThan(extraDt.y + 5)

  // dropped text blocks are de-emphasized; values beside their key are not
  const blockOpacity = await page.locator('#default dt', { hasText: 'lorem:' }).locator('..').locator('.nested-data-scalar').evaluate(el => parseFloat(getComputedStyle(el).opacity))
  expect(blockOpacity).toBeLessThan(1)
  await expect(page.locator('#default dd').first().locator('.nested-data-scalar')).toHaveCSS('opacity', '1')
})

test('allowHtml renders detected markup as html in an indented block; off by default', async ({ page }) => {
  // detected html renders as real elements, dropped below the key
  const html = page.locator('#html')
  await expect(html.locator('strong')).toHaveText('world')
  const dtBox = await html.locator('dt', { hasText: 'body:' }).boundingBox()
  const ddBox = await html.locator('dt', { hasText: 'body:' }).locator('..').locator('dd').boundingBox()
  expect(ddBox.y).toBeGreaterThan(dtBox.y + 5)
  // pre-line is off for html so the newline between the paragraphs adds nothing
  await expect(html.locator('.nested-data-html').first()).toHaveCSS('white-space', 'normal')
  // the html is framed and labeled so its own lists can't pass for data structure
  await expect(html.locator('.nested-data-html legend').first()).toHaveText('HTML')
  await expect(html.locator('fieldset.nested-data-html').first()).toHaveCSS('border-top-style', 'dotted')
  await expect(html.locator('.nested-data-html li')).toHaveText('a list inside the html')
  // dangerous markup is scrubbed before rendering: the script never ran, the
  // style that would have hidden the list item is gone (the li above is visible,
  // which toHaveText already proved), the iframe is removed, the javascript:
  // href and the onerror handler are dropped while their elements survive, and
  // the safe href is untouched
  expect(await page.evaluate(() => window.hacked)).toBeUndefined()
  await expect(html.locator('.nested-data-html script')).toHaveCount(0)
  await expect(html.locator('.nested-data-html style')).toHaveCount(0)
  await expect(html.locator('.nested-data-html iframe')).toHaveCount(0)
  const evilLink = html.locator('.nested-data-html a', { hasText: 'evil link' })
  await expect(evilLink).toHaveCount(1)
  expect(await evilLink.getAttribute('href')).toBeNull()
  const goodLink = html.locator('.nested-data-html a', { hasText: 'good link' })
  expect(await goodLink.getAttribute('href')).toBe('https://example.edu/archives')
  const img = html.locator('.nested-data-html img[alt="broken"]')
  await expect(img).toHaveCount(1)
  expect(await img.getAttribute('onerror')).toBeNull()

  // svg survives to draw, but loses its event handlers and smuggling compartments
  const svg = html.locator('.nested-data-html svg')
  await expect(svg).toHaveCount(1)
  expect(await svg.getAttribute('onload')).toBeNull()
  await expect(svg.locator('circle')).toHaveCount(1)
  await expect(svg.locator('foreignObject')).toHaveCount(0)
  await expect(html.locator('.nested-data-html').first()).not.toContainText('smuggled html')

  // the form displays but cannot submit anywhere
  const form = html.locator('.nested-data-html form')
  await expect(form).toHaveCount(1)
  expect(await form.getAttribute('action')).toBeNull()
  await expect(form.locator('button')).toHaveText('Subscribe')
  // values without tags render as plain inline text
  await expect(html.locator('dt', { hasText: 'plain:' }).locator('..').locator('.nested-data-html')).toHaveCount(0)

  // tall html clips to a max height with a "more content" indicator; short html does not
  const longField = html.locator('dt', { hasText: 'long:' }).locator('..').locator('fieldset')
  await expect(longField).toHaveClass(/nested-data-clipped/)
  await expect(longField.locator('.nested-data-html-more')).toHaveText('…')
  await expect(longField.locator('.nested-data-html-more')).toHaveAttribute('title', 'more content not shown')
  const longBox = await longField.boundingBox()
  expect(longBox.height).toBeLessThan(300)
  const shortField = html.locator('dt', { hasText: 'body:' }).locator('..').locator('fieldset')
  await expect(shortField).not.toHaveClass(/nested-data-clipped/)
  await expect(shortField.locator('.nested-data-html-more')).toHaveCount(0)

  // without allowHtml the markup stays escaped text
  const off = page.locator('#htmloff')
  await expect(off.locator('strong')).toHaveCount(0)
  await expect(off.locator('.nested-data-scalar').first()).toContainText('<p>Hello <strong>world</strong></p>')
})

test('a cycle elides immediately instead of repeating down to maxlevel', async ({ page }) => {
  const cyclic = page.locator('#cyclic')
  await expect(cyclic.locator('text=loop')).toHaveCount(1)
  await expect(cyclic.locator('dt', { hasText: 'self:' })).toHaveCount(1)
  // the placeholder appears at the point of the cycle, not maxlevel levels down
  await expect(cyclic.locator('.nested-data-elided')).toHaveText('{ ... }')
  await expect(cyclic.locator('dt', { hasText: 'name:' })).toHaveCount(1)
})

test('format receives the default-rendered string and can override by path', async ({ page }) => {
  const formatted = page.locator('#formatted')
  await expect(formatted.locator('text=$42.5')).toHaveCount(1)
  await expect(formatted.locator('text=plain')).toHaveCount(1)
})

test('format recognizes container marker shapes and returns trusted html, scrubbed and unframed', async ({ page }) => {
  const marker = page.locator('#marker')

  // the link marker collapses to an anchor beside its key, with no HTML frame
  const a = marker.locator('a', { hasText: 'Map PDF' })
  await expect(a).toHaveCount(1)
  expect(await a.getAttribute('href')).toBe('https://example.edu/map.pdf')
  await expect(marker.locator('fieldset')).toHaveCount(0)
  const dlDt = await marker.locator('dt', { hasText: 'download:' }).boundingBox()
  const dlDd = await marker.locator('dt', { hasText: 'download:' }).locator('..').locator('dd').boundingBox()
  expect(Math.abs(dlDd.y - dlDt.y)).toBeLessThan(5)

  // trusted html is still scrubbed: a javascript: href smuggled in through data
  // loses the href but keeps the label
  const bad = marker.locator('a', { hasText: 'bad' })
  await expect(bad).toHaveCount(1)
  expect(await bad.getAttribute('href')).toBeNull()
  expect(await page.evaluate(() => window.hacked)).toBeUndefined()

  // the image marker takes the block default and drops below its key at full strength
  const img = marker.locator('img[alt="maroon square"]')
  await expect(img).toHaveCount(1)
  const imgDt = await marker.locator('dt', { hasText: 'thumbnail:' }).boundingBox()
  const imgDd = await marker.locator('dt', { hasText: 'thumbnail:' }).locator('..').locator('dd').boundingBox()
  expect(imgDd.y).toBeGreaterThan(imgDt.y + 5)
  await expect(marker.locator('dt', { hasText: 'thumbnail:' }).locator('..').locator('.nested-data-trusted')).toHaveCSS('opacity', '1')
})
