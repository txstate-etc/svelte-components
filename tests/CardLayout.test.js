import { test, expect } from '@playwright/test'
import { sleep } from 'txstate-utils'

test.describe('Image Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cards')
    await sleep(200)
  })

  test('should show all 9 cards', async ({ page }) => {
    const cards = page.locator('.cardlayout-card')
    await expect(cards).toHaveCount(9)
  })
  test('should place each card further from the top than the last', async ({ page }) => {
    const cards = page.locator('.cardlayout-card')
    await expect(cards).toHaveCount(9)

    let lastoffset = 0
    for (let i = 0; i < 9; i++) {
      const top = (await cards.nth(i).boundingBox()).y
      expect(top).toBeGreaterThanOrEqual(lastoffset)
      lastoffset = top
    }
    expect(lastoffset).toBeGreaterThan(0)
  })
})
test.describe('Preserve Order Layout', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/cards/preserve')
    await sleep(200)
  })

  test('should preserve card order when instructed', async ({ page }) => {
    const cards = page.locator('.cardlayout-card')
    await expect(cards).toHaveCount(9)
    let lastleft = 0
    for (let i = 0; i < 9; i++) {
      const left = (await cards.nth(i).boundingBox()).x
      expect(left).toBeGreaterThanOrEqual(lastleft)
      lastleft = left
    }
  })
})
