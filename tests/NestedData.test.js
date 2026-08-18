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
