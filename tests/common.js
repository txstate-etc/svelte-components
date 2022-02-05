export async function goto (page, href) {
  await page.goto(href, { waitUntil: 'commit' })
  await page.evaluate(() => new Promise(resolve => window.addEventListener('sveltekit:start', resolve)))
}
