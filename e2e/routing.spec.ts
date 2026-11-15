import { expect, test } from '@playwright/test'

// BDD: routes are real links, arranged grade -> group -> case.
// A deep link opens the exact view; back returns to the band map; a malformed
// route degrades to a valid map; the handoff composes with a hash route.

test('deep link opens a case, back returns to the band map', async ({ page }) => {
  await page.goto('/#/grade-three/compare/c13-watch')
  await expect(page.locator('.case-title')).toHaveText('The Lighthouse Watch')
  await page.getByRole('button', { name: '← Map' }).click()
  await expect(page.locator('.case-title')).toHaveCount(0)
  await expect(page.locator('.case-card').first()).toBeVisible()
  expect(page.url()).toContain('#/grade-three/compare')
})

test('band route scrolls the map and survives a reload', async ({ page }) => {
  await page.goto('/#/grade-three/combine')
  await expect(page.locator('.band-head-label').first()).toHaveText('place-value')
  await expect(page.locator('.case-card').first()).toBeVisible()
  await page.reload({ waitUntil: 'networkidle' })
  await expect(page.locator('.band-head-label').first()).toHaveText('place-value')
  // The band route scrolls the map to that concept section.
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(20)
  expect(page.url()).toContain('#/grade-three/combine')
})

test('grade switch updates the hash and the map', async ({ page }) => {
  await page.goto('/#/grade-three')
  await expect(page.locator('.grade-pill.selected')).toHaveText('grade three')
  await page.getByRole('button', { name: 'grade one' }).click()
  expect(page.url()).toContain('#/grade-one')
  await expect(page.locator('.grade-pill.selected')).toHaveText('grade one')
})

test('a malformed route degrades to a valid map and normalizes the hash', async ({ page }) => {
  await page.goto('/#/grade-nine/bogus/nope')
  await expect(page.locator('.town-progress')).toBeVisible()
  await expect(page.locator('.case-card').first()).toBeVisible()
  await expect.poll(() => page.url()).toContain('#/grade-three')
})

test('a handoff code composes with a hash route', async ({ page }) => {
  await page.goto('/?code=MDA1.garbage#/grade-one')
  await expect(page.locator('.handoff-title')).toHaveText('Import this save code?')
  expect(page.url()).toContain('#/grade-one')
  await page.getByRole('button', { name: 'No, keep mine' }).click()
  await expect(page.locator('.handoff-panel')).toHaveCount(0)
  await expect(page.locator('.grade-pill.selected')).toHaveText('grade one')
})
