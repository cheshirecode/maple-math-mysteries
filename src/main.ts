import { el } from './voice.ts'
import { getProgress, migrate, updateProgress, subscribe } from './state.ts'
import { loadProgress, saveProgress } from './save/store.ts'
import { runCase, confetti } from './engine/run.ts'
import type { WidgetKind } from './engine/case.ts'
import { playFanfare } from './sfx.ts'
import { GRADES, gradeCases, gradeWord, gradeSlug, gradeFromSlug, isGradeActive, countWord, visibleCases, lockedTopics, TOPICS } from './grades.ts'
import { loadPack, packForGrade } from './content/packs.ts'
import { navigate, onRoute, startRouter, type Route } from './lib/router.ts'
import { openParentView } from './parent/parent.ts'
import { readHandoffCode, renderHandoff } from './parent/handoff.ts'
import './style.css'

let sessionSolves = 0
let breakDue = false
let justCompleted = false
let hideSolved = true
let lastCaseId: string | null = null
let handoffDone = false
let currentRoute: Route = { grade: 'grade-three' }

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

  const handoff = readHandoffCode()

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
    const renderedGrade = gradeFromSlug(currentRoute.grade) ?? progress.grade
    for (const g of GRADES) {
      const active = isGradeActive(g)
      const selected = renderedGrade === g
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
        // The selected pill is "where I am": tapping it goes home from a case.
        if (currentRoute.band || currentRoute.caseId) {
          b.addEventListener('click', () => navigate({ grade: gradeSlug(g) }))
        }
      } else {
        // Council-4 item 5: the progress write lives on the user-initiated
        // pill path; deep links and back never rewrite progression state.
        b.addEventListener('click', () => {
          justCompleted = false
          updateProgress((p) => ({
            ...p,
            grade: g,
            digitsMode: p.digitsMode,
          }))
          navigate({ grade: gradeSlug(g) })
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
    renderPicker()
    stage.innerHTML = ''
    const progress = getProgress()
    const routeGrade = gradeFromSlug(currentRoute.grade) ?? progress.grade
    if (!packForGrade(routeGrade)) {
      // Pack chunks load per grade on demand; every path funnels through here.
      // Re-read the route after the load resolves: the hash may have moved.
      void loadPack(routeGrade).then(() => render())
      stage.append(el('p', 'case-story', 'Opening the case files...'))
      return
    }
    const town = el('div', 'town')
    const doneSet = new Set(progress.completedCases)
    const cases = gradeCases(progress.grade)
    const visible = visibleCases(cases, progress.completedCases)
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
    for (const topic of TOPICS) {
      const tagPrefix = topic.requireTagPrefix
      const bandCases = visible.filter((c) => topic.kinds.includes(c.widget) && (!tagPrefix || (c.tags?.some((t) => t.startsWith(tagPrefix)) ?? false)))
      if (bandCases.length === 0) continue
      const bandSolved = bandCases.filter((c) => doneSet.has(c.id)).length
      const header = el('div', 'band-head')
      header.dataset.band = topic.key
      header.append(el('span', 'band-head-label', topic.label))
      header.append(
        el('span', 'band-head-count', `${countWord(bandSolved)} of ${countWord(bandCases.length)} closed`),
      )
      town.append(header)
      for (const def of bandCases) {
        const done = doneSet.has(def.id)
        if (done && hideSolved && doneCount < cases.length) continue
        const card = el('button', `case-card ${done ? 'done' : ''} ${!done && !nextAssigned ? 'next' : ''}`)
        if (!done && !nextAssigned) {
          card.append(el('span', 'case-card-hint', 'start here'))
          nextAssigned = true
        }
        card.append(el('span', 'case-card-title', def.titleNoDigits))
        if (done) card.append(el('span', 'case-card-badge', 'solved'))
        card.dataset.caseId = def.id
      card.addEventListener('click', () => {
        navigate({ grade: gradeSlug(routeGrade), band: def.widget, caseId: def.id })
      })
      town.append(card)
      }
    }
    const locked = lockedTopics(cases, progress.completedCases)
    if (locked.length > 0) {
      const waiting = locked.reduce((n, l) => n + l.count, 0)
      const shelf = el('button', 'case-card locked-shelf')
      shelf.append(
        el('span', 'case-card-title', `${countWord(waiting)} new mysteries wait`),
        el(
          'span',
          'case-card-group',
          `Solve more ${locked[0].label.toLowerCase()} cases to unlock the next learning.`,
        ),
      )
      shelf.setAttribute('aria-disabled', 'true')
      shelf.tabIndex = -1
      town.append(shelf)
    }
    stage.append(town)
    // Council-4 item 4: the handoff wins over a case route on first render —
    // the panel needs the map behind it, not a swallowed case view.
    if (handoff && !handoffDone) {
      renderHandoff(stage, handoff, () => {
        handoffDone = true
        render()
      })
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
    runRoute()
  }

  // Route rendering: a case route runs the exercise; a band route scrolls the
  // map to that concept section. The route is the single view source.
  const runRoute = () => {
    // Handoff wins over a case route: the panel needs the map behind it.
    if (handoff && !handoffDone) return
    const routeGrade = gradeFromSlug(currentRoute.grade) ?? getProgress().grade
    const band = currentRoute.band as WidgetKind | undefined
    if (currentRoute.caseId) {
      const def = gradeCases(routeGrade).find((c) => c.id === currentRoute.caseId)
      if (!def) {
        navigate({ grade: currentRoute.grade })
        return
      }
      lastCaseId = def.id
      breakDue = false
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
          navigate({ grade: gradeSlug(routeGrade), band: def.widget })
          const played = stage.querySelector<HTMLElement>(`[data-case-id="${lastCaseId}"]`)
          ;(played ?? stage.querySelector<HTMLElement>('.case-card'))?.focus()
        },
      })
    } else if (band) {
      // A locked band has no section yet: the shelf explains the lock.
      const head = stage.querySelector<HTMLElement>(`[data-band="${band}"]`)
      ;(head ?? stage.querySelector<HTMLElement>('.locked-shelf'))?.scrollIntoView({ block: 'start' })
    }
  }

  const dispatch = (route: Route) => {
    if (gradeFromSlug(route.grade) === null && route.grade !== '') {
      // Malformed grades degrade to the default route instead of an empty map.
      navigate({ grade: gradeSlug(getProgress().grade) })
      return
    }
    currentRoute = route
    render()
  }
  onRoute(dispatch)
  startRouter()

  setInterval(() => {
    if (document.visibilityState === 'visible') {
      updateProgress((p) => ({ ...p, minutesPlayed: p.minutesPlayed + 1 }))
    }
  }, 60000)
}

start()
