import { test, expect } from '@playwright/test'
import { goto } from './common.js'

test.beforeEach(async ({ page }) => {
  await goto(page, '/multiselect')
})

test('menus open on focus', async ({ page }) => {
  const firstselect = page.locator('[name="test1"]')
  const secondselect = page.locator('[name="test2"]')
  const appleInSecond = page.locator('text="Apple"')
  const bananaInFirst = page.locator('text="banana"')
  await expect(appleInSecond).toHaveCount(0)
  await expect(bananaInFirst).toHaveCount(0)
  firstselect.focus()
  await expect(bananaInFirst).toHaveCount(1)
  secondselect.focus()
  await expect(bananaInFirst).toHaveCount(0)
  await expect(appleInSecond).toHaveCount(1)
  secondselect.press('Escape')
  await expect(appleInSecond).toHaveCount(0)
})

test('able to add and remove items', async ({ page }) => {
  const firstselect = page.locator('[name="test1"]')
  const secondselect = page.locator('[name="test2"]')
  const bananaInFirst = page.locator('text="banana"')
  const orangeInFirst = page.locator('text="orange"')
  const appleInSecond = page.locator('text="Apple"')
  const bananaInSecond = page.locator('text="Banana"')
  const orangeInSecond = page.locator('text="Orange"')
  await expect(bananaInFirst).toHaveCount(0)
  firstselect.focus()
  await expect(bananaInFirst).toHaveCount(1)
  bananaInFirst.click()
  await expect(orangeInFirst).toHaveCount(0)
  await expect(bananaInFirst).toHaveCount(1)
  bananaInFirst.click()
  await expect(bananaInFirst).toHaveCount(0)

  await expect(appleInSecond).toHaveCount(0)
  await expect(bananaInSecond).toHaveCount(1)
  secondselect.press('Backspace')
  secondselect.press('Escape')
  await expect(bananaInSecond).toHaveCount(0)
  secondselect.press('ArrowLeft')
  await expect(orangeInSecond).toHaveCount(1)
  await expect(orangeInSecond).toHaveClass(/hilited/)
})

test('typing in the input reduces the options in the menu', async ({ page }) => {
  const firstselect = page.locator('[name="test1"]')
  const bananaInFirst = page.locator('text="banana"')
  const orangeInFirst = page.locator('text="orange"')
  firstselect.type('ora')
  await expect(bananaInFirst).toHaveCount(0)
  await expect(orangeInFirst).toHaveCount(1)
})