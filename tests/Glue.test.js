import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/actions/glue')
})

async function expectBottomLeft (page, id) {
  await expect(page.locator(`#${id}-align`)).toHaveText('bottomleft')
  const targetBox = await page.locator(`#${id}-target`).boundingBox()
  const gluedBox = await page.locator(`#${id}-element`).boundingBox()
  expect(Math.round(gluedBox.y)).toBe(Math.round(targetBox.y + targetBox.height))
  expect(Math.round(gluedBox.x)).toBe(Math.round(targetBox.x))
}

test('auto alignment uses viewport space even inside a fixed containing block', async ({ page }) => {
  await expectBottomLeft(page, 'transform')
})

test('container-type does not create a fixed containing block', async ({ page }) => {
  await expectBottomLeft(page, 'containertype')
})

test('a multi-value contain creates a fixed containing block', async ({ page }) => {
  await expectBottomLeft(page, 'containmulti')
})

test('a multi-value will-change creates a fixed containing block', async ({ page }) => {
  await expectBottomLeft(page, 'willchangemulti')
})
