import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/collapsingtable')
})

test('has two rows in tbody', async ({ page }) => {
  await expect(page.locator('text=John Smith')).toHaveCount(1)
  await expect(page.locator('text=Mary Sue')).toHaveCount(1)
})
test('hides the numerated columns on a small screen', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 1024 })
  await expect(page.locator('text="one"')).toHaveCount(0)
})

test('menu toggles when button is clicked', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 1024 })
  const button = page.locator('th').last()
  const menuitemtwo = page.locator('text="two"')
  await expect(menuitemtwo).toHaveCount(0)
  await expect(button).toHaveText(/^id/)
  await page.waitForTimeout(10)
  await button.click()
  await expect(menuitemtwo).toHaveCount(1)
  await button.click()
  await expect(menuitemtwo).toHaveCount(0)
})

test('able to activate a new row', async ({ page }) => {
  await page.setViewportSize({ width: 400, height: 1024 })
  const button = page.locator('th').last()
  const menuitemtwo = page.locator('text="two"')
  await expect(menuitemtwo).toHaveCount(0)
  await expect(button).toHaveText(/^id/)
  await page.waitForTimeout(10)
  button.click()
  await expect(menuitemtwo).toHaveCount(1)
  menuitemtwo.click()
  await expect(page.locator('text="2"')).toHaveCount(3)
})
