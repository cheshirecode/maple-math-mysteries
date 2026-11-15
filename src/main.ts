import { el } from './voice.ts'
import { getProgress, migrate, updateProgress, subscribe } from './state.ts'
import { loadProgress, saveProgress } from './save/store.ts'
import { runCase, confetti } from './engine/run.ts'
import type { WidgetKind } from './engine/case.ts'
import { playFanfare } from './sfx.ts'
import { GRADES, gradeCases, gradeWord, isGradeActive, countWord, visibleCases, lockedConcepts } from './grades.ts'
import { openParentView, importSaveText } from './parent/parent.ts'
import './style.css'

let sessionSolves = 0
let breakDue = false
let justCompleted = false
let hideSolved = true
let inCase = false
let lastCaseId: string | null = null

const CONCEPT_LABEL: Record<WidgetKind, string> = {
  dots: 'ticket-pair',
  blocks: 'place-value',
  arrays: 'equal-rows',
  fraction: 'fair-share',
  pattern: 'pattern-rule',
  measure: 'measuring',
  crate: 'net-folding',
  spinner: 'chance',
  coins: 'money',
  compare: 'comparing',
  combine: 'add-and-take-away',
}

function conceptLabel(kind: WidgetKind): string {
  return CONCEPT_LABEL[kind] ?? kind
}

function save(): void {
  saveProgress(getProgress())
}

subscribe(save)

export function start(): void {
  const stored = loadProgress()
  const root = document.getElementById('app')
  if (!root) return
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => undefined)
  }

  if (stored) {
    const restored = migrate(stored)
    updateProgress(() => ({ ...restored, digitsMode: false }))
  }

  let handoffCode = new URLSearchParams(location.search).get('code')
  if (handoffCode) history.replaceState(null, '', location.pathname)

  const header = el('header', 'topbar')
  const brand = el('h1', 'brand', 'Maple Math Mysteries')
  header.append(brand)

  const picker = el('div', 'grade-picker')
  picker.setAttribute('role', 'group')
  picker.setAttribute('aria-label', 'Grade')
  const note = el('div', 'grade-note')
  note.setAttribute('aria-live', 'polite')
  let noteTimer: ReturnType<typeof setTimeout> | undefined
  const showNote = (text: string) => {
    note.textContent = text
    clearTimeout(noteTimer)
    noteTimer = setTimeout(() => {
      note.textContent = ''
    }, 2500)
  }
  const renderPicker = () => {
    picker.innerHTML = ''
    const progress = getProgress()
    for (const g of GRADES) {
      const active = isGradeActive(g)
      const selected = progress.grade === g
      const b = el(
        'button',
        `grade-pill ${selected ? 'selected' : ''} ${active ? '' : 'off'}`,
        `grade ${gradeWord(g, progress.digitsMode)}`,
      )
      if (selected) b.setAttribute('aria-pressed', 'true')
      else b.setAttribute('aria-pressed', 'false')
      if (!active) {
        b.setAttribute('aria-disabled', 'true')
        b.title = 'Coming soon'
        b.dataset.soon = 'true'
        b.addEventListener('click', () =>
          showNote(`grade ${gradeWord(g, progress.digitsMode)} is coming soon`),
        )
      } else if (selected) {
        // The gold pill is "where I am". Tapping it from an exercise goes home;
        // on the map it is already home, so it stays quiet.
        if (inCase) {
          b.addEventListener('click', () => render())
        }
      } else if (inCase) {
        // Switching grades mid-exercise would silently wipe the widget; the
        // pills stay inert until the detective is back on the map.
        b.setAttribute('aria-disabled', 'true')
        b.title = 'Go back to the map first'
      } else {
        b.addEventListener('click', () => {
          justCompleted = false
          updateProgress((p) => ({
            ...p,
            grade: g,
            digitsMode: p.digitsMode,
          }))
          render()
        })
      }
      picker.append(b)
    }
  }
  renderPicker()

  // The stage holds whichever view is open - the town map or one case.
  // Views swap by clearing the stage only, so the header above survives.
  const stage = el('div', 'stage')
  const parentBtn = el('button', 'btn btn-ghost btn-small', 'Parent area')
  parentBtn.setAttribute('aria-label', 'Open parent area')
  parentBtn.addEventListener('click', () => {
    note.textContent = ''
    clearTimeout(noteTimer)
    openParentView(stage, () => render())
  })
  header.append(parentBtn)
  root.append(header, picker, note, stage)

  const render = () => {
    inCase = false
    renderPicker()
    stage.innerHTML = ''
    const town = el('div', 'town')
    const progress = getProgress()
    const doneSet = new Set(progress.completedCases)
    const cases = gradeCases(progress.grade)
    const visible = visibleCases(progress.grade, progress.completedCases)
    const doneCount = cases.filter((c) => doneSet.has(c.id)).length
    if (cases.length > 0) {
      const head = el('div', 'town-head')
      head.append(
        el(
          'div',
          'town-progress',
          `${countWord(doneCount)} of ${countWord(cases.length)} closed`,
        ),
      )
      if (doneCount > 0 && doneCount < cases.length) {
        const toggle = el('button', 'town-filter', hideSolved ? 'show solved' : 'hide solved')
        toggle.setAttribute('aria-pressed', String(!hideSolved))
        toggle.addEventListener('click', () => {
          hideSolved = !hideSolved
          render()
        })
        head.append(toggle)
      }
      town.append(head)
    }
    let nextAssigned = false
    for (const def of visible) {
      const done = doneSet.has(def.id)
      if (done && hideSolved && doneCount < cases.length) continue
      const card = el('button', `case-card ${done ? 'done' : ''} ${!done && !nextAssigned ? 'next' : ''}`)
      if (!done && !nextAssigned) {
        card.append(el('span', 'case-card-hint', 'start here'))
        nextAssigned = true
      }
      card.append(el('span', 'case-card-title', def.titleNoDigits))
      card.append(el('span', 'case-card-group', def.kidLabel))
      if (done) card.append(el('span', 'case-card-badge', 'solved'))
      card.dataset.caseId = def.id
      card.addEventListener('click', () => {
        breakDue = false
        inCase = true
        lastCaseId = def.id
        renderPicker()
        runCase(stage, def, {
          onBadge: (badge) => {
            updateProgress((p) =>
              p.badges.includes(badge)
                ? { ...p, completedCases: [...new Set([...p.completedCases, def.id])] }
                : { ...p, badges: [...p.badges, badge], completedCases: [...new Set([...p.completedCases, def.id])] },
            )
            const after = getProgress()
            const afterSet = new Set(after.completedCases)
            if (gradeCases(after.grade).every((c) => afterSet.has(c.id))) {
              justCompleted = true
            }
            sessionSolves++
            if (sessionSolves === 3) breakDue = true
          },
          onDone: () => {
            render()
            const played = stage.querySelector<HTMLElement>(`[data-case-id="${lastCaseId}"]`)
            ;(played ?? stage.querySelector<HTMLElement>('.case-card'))?.focus()
          },
        })
      })
      town.append(card)
    }
    const locked = lockedConcepts(progress.grade, progress.completedCases)
    if (locked.length > 0) {
      const waiting = locked.reduce((n, l) => n + l.count, 0)
      const shelf = el('button', 'case-card locked-shelf')
      shelf.append(
        el('span', 'case-card-title', `${countWord(waiting)} new mysteries wait`),
        el(
          'span',
          'case-card-group',
          `Solve more ${conceptLabel(locked[0].kind)} cases to unlock the next learning.`,
        ),
      )
      shelf.setAttribute('aria-disabled', 'true')
      shelf.tabIndex = -1
      town.append(shelf)
    }
    stage.append(town)
    if (handoffCode) {
      const code = handoffCode
      const handoff = el('div', 'break-nudge')
      handoff.setAttribute('aria-live', 'polite')
      handoff.append(el('p', '', 'A save code arrived from another device.'))
      const loadBtn = el('button', 'btn', 'Load this code')
      loadBtn.addEventListener('click', async () => {
        try {
          await importSaveText(code)
        } catch {
          handoffCode = null
        }
        handoffCode = null
        render()
      })
      const skipBtn = el('button', 'btn btn-ghost', 'Not now')
      skipBtn.addEventListener('click', () => {
        handoffCode = null
        render()
      })
      handoff.append(loadBtn, skipBtn)
      stage.append(handoff)
    }
    if (justCompleted) {
      justCompleted = false
      const banner = el('div', 'town-banner')
      banner.setAttribute('aria-live', 'polite')
      banner.append(el('p', 'town-banner-title', 'Every case in town is closed, detective.'))
      banner.append(
        el(
          'p',
          'town-banner-sub',
          `All ${countWord(cases.length)} badges are yours. Stretch your legs, then try a mystery again from the start.`,
        ),
      )
      const keepBtn = el('button', 'btn', 'Keep playing')
      keepBtn.addEventListener('click', () => render())
      banner.append(keepBtn)
      stage.append(banner)
      confetti(banner, true)
      playFanfare()
    }
    if (breakDue) {
      const nudge = el('div', 'break-nudge')
      nudge.setAttribute('aria-live', 'polite')
      nudge.append(el('p', '', 'Three cases closed, detective. Stretch your legs, then come back.'))
      const keepBtn = el('button', 'btn', 'Keep playing')
      keepBtn.addEventListener('click', () => {
        breakDue = false
        render()
      })
      nudge.append(keepBtn)
      stage.append(nudge)
    }
  }

  render()

  setInterval(() => {
    if (document.visibilityState === 'visible') {
      updateProgress((p) => ({ ...p, minutesPlayed: p.minutesPlayed + 1 }))
    }
  }, 60000)
}

start()
