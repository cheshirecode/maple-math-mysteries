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

  await page.locator('.case-card').first().click()
  await expect(page.locator('.case-title')).toHaveText('The Locked Safe')

  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'add big block' }).click()
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'add long block' }).click()
  for (let i = 0; i < 2; i++) await page.getByRole('button', { name: 'add small block' }).click()
  await page.getByRole('button', { name: 'Check the lock' }).click()
  await expect(page.locator('.case-feedback')).toHaveText('Case closed!')

  await page.getByRole('button', { name: 'parent' }).click()
  await expect(page.locator('.parent-code')).toHaveCount(2)
  await page.locator('.parent-code').first().fill('maplesyrup42')
  await page.locator('.parent-code').nth(1).fill('maplesyrup42')
  await page.getByRole('button', { name: 'Set access code' }).click()
  await expect(page.locator('.parent-stats')).toBeVisible()

  await page.getByRole('button', { name: 'Build save-string' }).click()
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

  await m.getByRole('button', { name: 'parent' }).click()
  await expect(m.locator('.parent-code')).toHaveCount(2)
  await m.locator('.parent-code').first().fill('pancake99')
  await m.locator('.parent-code').nth(1).fill('pancake99')
  await m.getByRole('button', { name: 'Set access code' }).click()
  await expect(m.locator('.parent-stats')).toBeVisible()

  await m.locator('.parent-io').nth(1).fill(carried.save)
  await m.getByRole('button', { name: 'Import', exact: true }).click()
  await expect(m.locator('.parent-msg').last()).toHaveText('Progress imported and saved.')

  await m.getByRole('button', { name: 'Back to the map' }).click()
  await expect(m.locator('.case-card.done')).toHaveCount(1)

  const flow = await m.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
    btnMin: getComputedStyle(document.querySelector('.btn') as HTMLElement).minHeight,
    minutes: (JSON.parse(localStorage.getItem('mda.progress.v1') as string) as { minutesPlayed: number }).minutesPlayed,
  }))
  expect(flow.scrollW).toBeLessThanOrEqual(flow.innerW + 1)
  expect(parseInt(flow.btnMin, 10)).toBeGreaterThanOrEqual(40)
  expect(flow.minutes).toBe(carried.desktopMinutes)
  await m.screenshot({ path: testInfo.outputPath('mobile-import.png') })
  await mobile.close()
}