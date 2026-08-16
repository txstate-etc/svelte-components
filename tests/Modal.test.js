import { test, expect } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/modal')
})

test('replacing one modal with another does not steal focus back out of the new modal', async ({ page }) => {
  await page.goto('/modal/replace')
  await page.click('#open-a')
  await expect(page.locator('#replace')).toHaveCount(1)
  // record every element that receives focus from here on; the destroyed modal's
  // focus lock waits a frame before restoring focus, so even a momentary steal
  // (immediately corrected by the new lock) will show up in the log
  await page.evaluate(() => {
    window.__focuslog = []
    document.addEventListener('focusin', e => { window.__focuslog.push(e.target instanceof HTMLElement ? e.target.id : '') }, true)
  })
  await page.click('#replace')
  await expect(page.locator('#title')).toHaveCount(1)
  await page.waitForTimeout(250)
  expect(await page.evaluate(() => window.__focuslog)).not.toContain('open-a')
  const focusInsideModal = await page.evaluate(() => document.querySelector('[role="alertdialog"]')?.contains(document.activeElement))
  expect(focusInsideModal).toBe(true)
})

test('when one modal replaces another, closing the second returns focus to the original trigger', async ({ page }) => {
  await page.goto('/modal/replace')
  // use press instead of click: webkit does not focus buttons on click, and the
  // trigger must actually have focus for the modal to record it as returnfocusto
  await page.locator('#open-a').press('Enter')
  await page.click('#replace')
  const title = page.locator('#title')
  await expect(title).toHaveCount(1)
  await title.press('Escape')
  await expect(title).toHaveCount(0)
  await expect(page.locator('#open-a')).toBeFocused()
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
