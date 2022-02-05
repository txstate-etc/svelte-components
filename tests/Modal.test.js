import { test, expect } from '@playwright/test'
import { goto } from './common.js'

test.beforeEach(async ({ page }) => {
  await goto(page, '/modal')
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
