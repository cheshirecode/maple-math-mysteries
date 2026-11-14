import { expect, test, devices } from '@playwright/test'

// Given a clean desktop session on the built app
// When the child solves a case and the parent exports a save-string
// Then a mobile-emulated fresh session imports it and continues

test('desktop export to mobile import carries progress', async ({ browser }, testInfo) => {
  const carried = await exportOnDesktop(browser, testInfo)
  await importOnMobile(browser, testInfo, carried)
})

async function exportOnDesktop(browser: import('@playwright/test').Browser, testInfo: import('@playwright/test').TestInfo) {
  const desktop = await browser.newContext()
  const page = await desktop.newPage()
  await page.goto('/')

  await expect(page.locator('.case-card')).toHaveCount(9)
  await expect(page.locator('.case-card-hint')).toHaveText('start here')
  expect(await page.evaluate(() => document.body.innerText.match(/\d/))).toBeNull()

  await expect(page.locator('.grade-pill')).toHaveCount(5)
  await expect(page.locator('.grade-pill.selected')).toHaveText('grade three')
  await expect(page.locator('.grade-pill.off')).toHaveCount(4)
  await expect(page.locator('.grade-pill.off').first()).toHaveAttribute('aria-disabled', 'true')

  await page.locator('.case-card').first().click()
  await expect(page.locator('.case-title')).toHaveText('The Locked Safe')

  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'add big block' }).click()
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'add long block' }).click()
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'add small block' }).click()
  await page.getByRole('button', { name: 'Check the lock' }).click()
  await expect(page.locator('.case-feedback')).toHaveText('Case closed!')

  // Solve two more cases so sessionSolves hits 3 and the break nudge appears.
  await page.getByRole('button', { name: 'Back to the map' }).click()
  await page.locator('.case-card').nth(1).click()
  await expect(page.locator('.case-title')).toHaveText('The Streetcar Fare')
  await page.locator('.dots-option').first().click()
  await expect(page.locator('.case-feedback')).toHaveText('Case closed!')

  await page.getByRole('button', { name: 'Back to the map' }).click()
  await page.locator('.case-card').nth(2).click()
  await expect(page.locator('.case-title')).toHaveText('The Equal Loot')
  await page.locator('.arrays-options button').first().click()
  await expect(page.locator('.case-feedback')).toHaveText('Case closed!')

  await page.getByRole('button', { name: 'Back to the map' }).click()
  await expect(page.locator('.break-nudge')).toBeVisible()
  await expect(page.locator('.break-nudge')).toContainText('Stretch your legs')
  await page.getByRole('button', { name: 'Keep playing' }).click()
  await expect(page.locator('.break-nudge')).toHaveCount(0)

  await page.getByRole('button', { name: 'Parent area' }).click()
  await expect(page.locator('.parent-stats')).toBeVisible()

  await page.getByRole('button', { name: 'Build save code' }).click()
  const exportBox = page.locator('.parent-io').first()
  await expect(exportBox).toHaveValue(/^MDA1\.1\./)
  const save = await exportBox.inputValue()
  expect(save.length).toBeGreaterThan(100)
  const desktopMinutes = await page.evaluate(() =>
    (JSON.parse(localStorage.getItem('mda.progress.v1') as string) as { minutesPlayed: number }).minutesPlayed,
  )
  await page.screenshot({ path: testInfo.outputPath('desktop-export.png') })
  await desktop.close()
  return { save, desktopMinutes }
}

async function importOnMobile(
  browser: import('@playwright/test').Browser,
  testInfo: import('@playwright/test').TestInfo,
  carried: { save: string; desktopMinutes: number },
) {
  const mobile = await browser.newContext({ ...devices['iPhone 13'] })
  const m = await mobile.newPage()
  await m.goto('/')

  await expect(m.locator('.case-card')).toHaveCount(9)
  await expect(m.locator('.case-card.done')).toHaveCount(0)

  await m.getByRole('button', { name: 'Parent area' }).click()
  await expect(m.locator('.parent-stats')).toBeVisible()

  await m.locator('.parent-io').nth(1).fill(carried.save)
  await m.getByRole('button', { name: 'Load code', exact: true }).click()
  await expect(m.locator('.parent-msg').last()).toHaveText('Progress imported and saved.')

  await m.getByRole('button', { name: 'Back to the map' }).click()
  await expect(m.locator('.case-card.done')).toHaveCount(3)

  const flow = await m.evaluate(() => {
    const tap = document.querySelector('.btn:not(.btn-small)') ?? document.querySelector('.case-card')
    return {
      scrollW: document.documentElement.scrollWidth,
      innerW: window.innerWidth,
      btnMin: tap ? (tap as HTMLElement).getBoundingClientRect().height : 0,
      minutes: (JSON.parse(localStorage.getItem('mda.progress.v1') as string) as { minutesPlayed: number }).minutesPlayed,
    }
  })
  expect(flow.scrollW).toBeLessThanOrEqual(flow.innerW + 1)
  expect(flow.btnMin).toBeGreaterThanOrEqual(40)
  expect(flow.minutes).toBe(carried.desktopMinutes)
  await m.screenshot({ path: testInfo.outputPath('mobile-import.png') })
  await mobile.close()
}
