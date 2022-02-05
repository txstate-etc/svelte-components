import { test, expect } from '@playwright/test'
import { sleep } from 'txstate-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/modal')
  await sleep(200)
})

test('modal is active on first render, escape dismisses, hitting enter on the button brings it back, escaping puts focus on the button', async ({ page }) => {
  const button = page.locator('#test-button')
  const nameInput = page.locator('#firstname')
  await expect(nameInput).toHaveCount(1)
  await nameInput.press('Escape')
  await expect(nameInput).toHaveCount(0)
  await button.press('Enter')
  await expect(nameInput).toHaveCount(1)
  await nameInput.press('Escape')
  await expect(page.locator('#test-button')).toBeFocused()
})
