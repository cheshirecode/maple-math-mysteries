import { expect, test, devices } from '@playwright/test'
import { readFileSync } from 'node:fs'
import { GRADES, countWord, visibleCases, lockedConcepts, sortBandCases } from '../src/grades.ts'
import type { CaseDef } from '../src/engine/case.ts'

// Pack data straight from the repo; the model helpers stay pure over case lists.
const WORD: Record<number, string> = { 1: 'one', 2: 'two', 3: 'three', 4: 'four', 5: 'five' }
const casesByGrade: Record<number, CaseDef[]> = {}
for (const g of GRADES) {
  const raw = JSON.parse(readFileSync(new URL(`../content/cases/grade-${WORD[g]}.json`, import.meta.url), 'utf8'))
  casesByGrade[g] = raw.cases
}
const gradeCases = (grade: number): CaseDef[] => casesByGrade[grade] ?? []

// Given a clean desktop session on the built app
// When the child solves a case and the parent exports a save-string
// Then a mobile-emulated fresh session imports it and continues

// Derived from src/content/packs.ts so content changes flow through here.
// Cards on the map follow the progression model: unlocked bands only.
const CARDS = '.case-card:not(.locked-shelf)'
const GRADE_THREE_FRESH = visibleCases(gradeCases(3), []).length
// The desktop walk solves the first three blocks-band cases in display order.
const WALKED = sortBandCases(gradeCases(3).filter((c) => c.widget === 'blocks'))
  .slice(0, 3)
  .map((c) => c.id)
const GRADE_ONE_FRESH = visibleCases(gradeCases(1), []).length
const GRADE_ONE_COUNT = gradeCases(1).length

test('desktop export to mobile import carries progress', async ({ browser }, testInfo) => {
  const carried = await exportOnDesktop(browser, testInfo)
  await importOnMobile(browser, testInfo, carried)
})



// Detect the widget from the DOM and solve it generically.
async function solveAny(page: import('@playwright/test').Page): Promise<string> {
  await page.locator('.case-widget > *').first().waitFor()
  if (await page.locator('.blocks-target-row').count()) {
    await solveBlocks(page)
    return 'blocks'
  }
  if (await page.locator('.dots-options').count()) {
    await page.locator('.dots-option').first().click()
    return 'dots'
  }
  if (await page.locator('.arrays-options').count()) {
    await page.locator('.arrays-options button').first().click()
    return 'arrays'
  }
  if (await page.locator('.fraction-options').count()) {
    await page.locator('.fraction-option').first().click()
    return 'fraction'
  }
  if (await page.locator('.pattern-options').count()) {
    await page.locator('.pattern-option').first().click()
    return 'pattern'
  }
  if (await page.locator('.compare-options').count()) {
    await solveCompare(page)
    return 'compare'
  }
  if (await page.locator('.coins-controls').count()) {
    await solveCoins(page)
    return 'coins'
  }
  if (await page.locator('.measure-target').count()) {
    await solveMeasure(page)
    return 'measure'
  }
  if (await page.locator('.net').count()) {
    await solveCrate(page)
    return 'crate'
  }
  throw new Error('unknown widget on the case view')
}

// The fee picture shows the coins; pay the same multiset.
async function solveCoins(page: import('@playwright/test').Page): Promise<void> {
  const fee = await page.evaluate(() => {
    const row = document.querySelector('.coins-fee-row, .coins-board .coins-row')
    if (!row) return []
    return [...row.querySelectorAll('.coin')].map((c) => {
      const cls = c.className.includes('coin-q') ? 'quarter' : c.className.includes('coin-d') ? 'dime' : c.className.includes('coin-n') ? 'nickel' : 'penny'
      return cls
    })
  })
  for (const name of fee) await page.getByRole('button', { name, exact: true }).click()
  await page.getByRole('button', { name: 'Pay the fee' }).click()
}

// The target cups sit at the top; pick the jug filling to the same count.
async function solveMeasure(page: import('@playwright/test').Page): Promise<void> {
  const cups = await page.evaluate(() => document.querySelectorAll('.measure-target .cup').length)
  const fills = await page.evaluate(() => [...document.querySelectorAll('.jug')].map((j) => j.querySelectorAll('.jug-fill').length))
  const index = fills.findIndex((f) => f === cups)
  await page.locator('.spinner-options, .measure-target ~ *').locator('button').nth(index === -1 ? 0 : index).click().catch(() => {})
  await page.getByRole('button', { name: /pour|fill/i }).click().catch(() => {})
}

// Count the faces: the net folds to the crate with the matching stack.
async function solveCrate(page: import('@playwright/test').Page): Promise<void> {
  const faces = await page.evaluate(() => document.querySelectorAll('.net .net-tile').length)
  const stacks = await page.evaluate(() => [...document.querySelectorAll('.face-stack')].map((s) => s.querySelectorAll('.face-tile').length))
  const index = stacks.findIndex((n) => n === faces)
  await page.locator('.fraction-option').nth(index === -1 ? 0 : index).click()
}

// Read the target picture and build the matching stacks.
async function solveBlocks(page: import('@playwright/test').Page): Promise<void> {
  await page.locator('.blocks-target-row').first().waitFor()
  const want = await page.evaluate(() => {
    const count = (cls: string) => document.querySelectorAll(`.blocks-target-row.${cls} .block`).length
    return { h: count('hundreds'), t: count('tens'), o: count('ones') }
  })
  for (let i = 0; i < want.h; i++) await page.getByRole('button', { name: 'add big block' }).click()
  for (let i = 0; i < want.t; i++) await page.getByRole('button', { name: 'add long block' }).click()
  for (let i = 0; i < want.o; i++) await page.getByRole('button', { name: 'add small block' }).click()
  await page.getByRole('button', { name: 'Check the stacks' }).click()
}

// Read both block pictures as numbers and tap the larger one.
async function solveCompare(page: import('@playwright/test').Page): Promise<void> {
  await page.locator('.compare-option').first().waitFor()
  const value = (index: number) =>
    page.evaluate((idx) => {
      const opt = document.querySelectorAll('.compare-option')[idx]
      if (!opt) return -1
      const count = (cls: string) => opt.querySelectorAll(`.compare-row.${cls} .block`).length
      return count('hundreds') * 100 + count('tens') * 10 + count('ones')
    }, index)
  const a = await value(0)
  const b = await value(1)
  await page.locator('.compare-option').nth(a > b ? 0 : 1).click()
}

async function exportOnDesktop(browser: import('@playwright/test').Browser, testInfo: import('@playwright/test').TestInfo) {
  const desktop = await browser.newContext()
  const page = await desktop.newPage()
  await page.addInitScript(() => {
    const synth = window.speechSynthesis
    ;(window as unknown as { __spokenCount: number }).__spokenCount = 0
    if (synth) {
      const orig = synth.speak.bind(synth)
      synth.speak = (u: SpeechSynthesisUtterance) => {
        ;(window as unknown as { __spokenCount: number }).__spokenCount++
        return orig(u)
      }
    }
  })
  await page.goto('/')

  await expect(page.locator(CARDS)).toHaveCount(GRADE_THREE_FRESH)
  await expect(page.locator('.case-card-hint')).toHaveText('start here')
  expect(await page.evaluate(() => document.body.innerText.match(/\d/))).toBeNull()

  await expect(page.locator('.grade-pill')).toHaveCount(GRADES.length)
  await expect(page.locator('.grade-pill.selected')).toHaveText('grade three')
  await expect(page.locator('.grade-pill.off')).toHaveCount(0)

  // BDD: every grade has its own case set. Switch to grade one, then back.
  await page.getByRole('button', { name: 'grade one' }).click()
  await expect(page.locator(CARDS)).toHaveCount(GRADE_ONE_FRESH)
  await expect(page.locator('.town-progress')).toHaveText(`zero of ${countWord(GRADE_ONE_COUNT)} closed`)
  await page.getByRole('button', { name: 'grade three' }).click()
  await expect(page.locator(CARDS)).toHaveCount(GRADE_THREE_FRESH)

  await page.locator(CARDS).first().click()
  await expect(page.locator('.case-title')).toBeVisible()
  await expect(page.locator('[aria-label="Hear this line"]').first()).toBeVisible()
  // BDD: voice is tap-only — nothing speaks before the child taps a line.
  const spoken = () => page.evaluate(() => (window as unknown as { __spokenCount: number }).__spokenCount)
  expect(await spoken()).toBe(0)
  await page.locator('[aria-label="Hear this line"]').first().click()
  expect(await spoken()).toBe(1)

  // BDD: the selected grade pill is "home" during an exercise; other pills are inert.
  await page.getByRole('button', { name: 'grade three' }).click()
  await expect(page.locator('.case-title')).toHaveCount(0)
  await expect(page.locator('.town-progress')).toBeVisible()
  await page.locator(CARDS).first().click()
  await expect(page.locator('.case-title')).toBeVisible()
  // Council-4 item 5: pills navigate now; mid-case inertness is obsolete.
  // The selected pill goes home; an unselected pill switches grade with an
  // explicit navigation, so re-open the case afterwards.
  await page.getByRole('button', { name: 'grade three' }).click()
  await expect(page.locator('.case-title')).toHaveCount(0)
  await page.getByRole('button', { name: 'grade one' }).click()
  await expect(page.locator('.grade-pill.selected')).toHaveText('grade one')
  await page.getByRole('button', { name: 'grade three' }).click()
  await expect(page.locator('.grade-pill.selected')).toHaveText('grade three')
  await page.locator(CARDS).first().click()
  await expect(page.locator('.case-title')).toBeVisible()
  await page.getByRole('button', { name: '← Map' }).click()
  await expect(page.locator('.case-title')).toHaveCount(0)
  await expect(page.locator('.town-progress')).toBeVisible()
  await page.waitForTimeout(400)

  // BDD: the walk solves whatever the map offers next. The generic solver
  // reads each widget from the DOM, so generated content cannot break it.
  const solvedIds: string[] = []
  let sawDots = false
  let nudgesSeen = 0
  for (let i = 0; i < 14; i++) {
    // Every reachable case solved: hide-solved leaves an empty map.
    if ((await page.locator(CARDS).count()) === 0) break
    await page.waitForTimeout(300)
    await page.locator(CARDS).first().click()
    await expect(page.locator('.case-title')).toBeVisible()
    const kind = await solveAny(page)
    await page.waitForTimeout(300)
    await expect(page.locator('.case-feedback')).toHaveText('Case closed!')
    if (kind === 'dots') sawDots = true
    const solvedNow = await page.evaluate(() => {
      return JSON.parse(localStorage.getItem('mda.progress.v1') as string).completedCases as string[]
    })
    solvedIds.length = 0
    solvedIds.push(...solvedNow)
    await page.getByRole('button', { name: '← Map' }).click()
    await expect(page.locator('.town-progress')).toBeVisible()
    // The break nudge appears after three solves in the session.
    if (await page.locator('.break-nudge').count()) {
      await expect(page.locator('.break-nudge')).toContainText('Stretch your legs')
      await page.getByRole('button', { name: 'Keep playing' }).click()
      await expect(page.locator('.break-nudge')).toHaveCount(0)
      nudgesSeen++
    }
    if (sawDots && solvedIds.length >= 4) break
  }

  // BDD: the nudge appeared once per session after the third solve.
  expect(nudgesSeen).toBe(1)
  // BDD: solved cases hide by default; the filter offers them back. The
  // expected counts derive from the same solved set the app persisted.
  await expect(page.locator('.town-filter')).toHaveText('show solved')
  await expect(page.locator(CARDS)).toHaveCount(visibleCases(gradeCases(3), solvedIds).length - solvedIds.length)
  await page.getByRole('button', { name: 'show solved' }).click()
  await expect(page.locator(CARDS)).toHaveCount(visibleCases(gradeCases(3), solvedIds).length)
  await page.getByRole('button', { name: 'hide solved' }).click()
  await expect(page.locator(CARDS)).toHaveCount(visibleCases(gradeCases(3), solvedIds).length - solvedIds.length)

  await page.getByRole('button', { name: 'Parent area' }).click()
  await expect(page.locator('.parent-stats')).toBeVisible()

  await page.getByRole('button', { name: 'Build save code' }).click()
  const exportBox = page.locator('.parent-io').first()
  await expect(exportBox).toHaveValue(/^MDA1\.1\./)
  const save = await exportBox.inputValue()
  expect(save.length).toBeGreaterThan(100)

  // BDD: the QR handoff. Show QR renders a scannable code for this page.
  await page.getByRole('button', { name: 'Show QR' }).click()
  await expect(page.locator('.parent-qr canvas')).toBeVisible()
  // BDD: the QR encodes the handoff URL with the code attached.
  const decoded = await page.evaluate(async () => {
    const cdn = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/+esm'
    const src = (await import(/* @vite-ignore */ cdn)).default
    const canvas = document.querySelector('.parent-qr canvas') as HTMLCanvasElement
    const scale = 2
    const quiet = 8
    const big = document.createElement('canvas')
    big.width = canvas.width * scale + quiet * 2
    big.height = canvas.height * scale + quiet * 2
    const ctx = big.getContext('2d')!
    ctx.fillStyle = '#ffffff'
    ctx.fillRect(0, 0, big.width, big.height)
    ctx.imageSmoothingEnabled = false
    ctx.drawImage(canvas, quiet, quiet, canvas.width * scale, canvas.height * scale)
    const data = ctx.getImageData(0, 0, big.width, big.height)
    const result = src(data.data, big.width, big.height)
    return result?.data ?? null
  })
  const served = new URL(page.url())
  expect(decoded).toBe(`${served.origin}${served.pathname}?code=${encodeURIComponent(save)}`)
  const desktopMinutes = await page.evaluate(() =>
    (JSON.parse(localStorage.getItem('mda.progress.v1') as string) as { minutesPlayed: number }).minutesPlayed,
  )
  const solvedCount = solvedIds.length
  await page.screenshot({ path: testInfo.outputPath('desktop-export.png') })
  await desktop.close()
  return { save, desktopMinutes, solvedCount }
}

async function importOnMobile(
  browser: import('@playwright/test').Browser,
  testInfo: import('@playwright/test').TestInfo,
  carried: { save: string; desktopMinutes: number; solvedCount: number },
) {
  const mobile = await browser.newContext({ ...devices['iPhone 13'] })
  const m = await mobile.newPage()
  await m.goto('/')

  await expect(m.locator(CARDS)).toHaveCount(visibleCases(gradeCases(3), []).length)
  await expect(m.locator(CARDS + '.done')).toHaveCount(0)

  await m.getByRole('button', { name: 'Parent area' }).click()
  await expect(m.locator('.parent-stats')).toBeVisible()

  await m.locator('.parent-io').nth(1).fill(carried.save)
  await m.getByRole('button', { name: 'Load code', exact: true }).click()
  await expect(m.locator('.parent-msg').last()).toHaveText('Progress imported and saved.')

  await m.getByRole('button', { name: 'Back to the map' }).click()
  await m.getByRole('button', { name: 'show solved' }).click()
  await expect(m.locator(CARDS + '.done')).toHaveCount(carried.solvedCount)

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

  // BDD: the QR handoff. A fresh scan opens the page with ?code= and the panel
  // states that importing replaces local progress.
  const scanned = await mobile.newPage()
  await scanned.goto(`/?code=${encodeURIComponent(carried.save)}`)
  await expect(scanned.locator('.handoff-title')).toHaveText('Import this save code?')
  expect(scanned.url()).not.toContain('code=')
  await expect(scanned.locator('.handoff-sub')).toHaveText('It replaces the progress on this device.')
  await expect(scanned.locator('.handoff-panel [role=alertdialog]')).toHaveCount(0)
  await expect(scanned.locator('.handoff-panel')).toHaveRole('alertdialog')
  await expect(scanned.getByRole('button', { name: 'Yes, import it' })).toBeFocused()
  await scanned.getByRole('button', { name: 'Yes, import it' }).click()
  await expect(scanned.locator('.handoff-panel')).toHaveCount(0)
  await scanned.getByRole('button', { name: 'show solved' }).click()
  await expect(scanned.locator(CARDS + '.done')).toHaveCount(carried.solvedCount)
  await scanned.close()

  // BDD: the decline branch keeps local progress untouched.
  const declined = await mobile.newPage()
  await declined.goto(`/?code=${encodeURIComponent(carried.save)}`)
  await expect(declined.locator('.handoff-title')).toHaveText('Import this save code?')
  await declined.getByRole('button', { name: 'No, keep mine' }).click()
  await expect(declined.locator('.handoff-panel')).toHaveCount(0)
  await expect(declined.locator(CARDS + '.done')).toHaveCount(0)
  await declined.close()
  await m.screenshot({ path: testInfo.outputPath('mobile-import.png') })
  await mobile.close()
}

// BDD: a corrupt handoff code shows a visible failure and keeps the panel.
// Red against the old silent catch by design.
test('a bad handoff code shows a visible failure', async ({ browser }) => {
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto('/?code=MDA1.garbage')
  await expect(page.locator('.handoff-title')).toHaveText('Import this save code?')
  await page.getByRole('button', { name: 'Yes, import it' }).click()
  await expect(page.locator('.handoff-msg')).toContainText('did not work')
  await expect(page.locator('.handoff-panel')).toBeVisible()
  await expect(page.locator(CARDS + '.done')).toHaveCount(0)
  await ctx.close()
})
