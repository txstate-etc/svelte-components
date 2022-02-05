import { test, expect } from '@playwright/test'
import { sleep } from 'txstate-utils'

test.beforeEach(async ({ page }) => {
  await page.goto('/popupmenu')
  await sleep(200)
})

test('menu toggles when button is clicked', async ({ page }) => {
  const button = page.locator('#test-button')
  const monday = page.locator('text="Monday"')
  await expect(button).toHaveCount(1)
  await expect(monday).toHaveCount(0)
  button.click()
  await expect(monday).toHaveCount(1)
  button.click()
  await expect(monday).toHaveCount(0)
  button.press('Enter')
  await expect(monday).toHaveCount(1)
  button.press('Enter')
  await expect(monday).toHaveCount(0)
})

test('has five menu items', async ({ page }) => {
  const button = page.locator('#test-button')
  await expect(button).toHaveCount(1)
  button.click()
  await expect(page.locator('text="Monday"')).toHaveCount(1)
  await expect(page.locator('text="Tuesday"')).toHaveCount(1)
  await expect(page.locator('text="Wednesday"')).toHaveCount(1)
  await expect(page.locator('text="Thursday"')).toHaveCount(1)
  await expect(page.locator('text="Friday"')).toHaveCount(1)
})

test('clicking a menu option selects it', async ({ page }) => {
  const button = page.locator('#test-button')
  await expect(button).toHaveCount(1)
  button.click()
  const option = page.locator('text="Monday"')
  await expect(option).toHaveCount(1)
  await expect(page.locator('text=selected: 1')).toHaveCount(0)
  option.click()
  await expect(page.locator('text=selected: 1')).toHaveCount(1)
})

test('may select a menu option with the keyboard', async ({ page }) => {
  const button = page.locator('#test-button')
  await expect(button).toHaveCount(1)
  button.click()
  const option = page.locator('text="Monday"')
  await expect(option).toHaveCount(1)
  await expect(page.locator('text=selected: 1')).toHaveCount(0)
  await button.press('ArrowDown')
  await button.press('Enter')
  await expect(page.locator('text=selected: 1')).toHaveCount(1)
})
