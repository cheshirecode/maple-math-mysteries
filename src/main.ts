import { el } from './voice.ts'
import { getProgress, migrate, updateProgress, subscribe } from './state.ts'
import { loadProgress, saveProgress } from './save/store.ts'
import { runCase } from './engine/run.ts'
import { GRADES, gradeCases, gradeWord, isGradeActive, COUNT_WORD } from './grades.ts'
import { openParentView } from './parent/parent.ts'
import './style.css'

let sessionSolves = 0
let breakDue = false

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
      } else if (!selected) {
        b.addEventListener('click', () => {
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
  parentBtn.addEventListener('click', () => openParentView(stage, () => render()))
  header.append(parentBtn)
  root.append(header, picker, note, stage)

  const render = () => {
    renderPicker()
    stage.innerHTML = ''
    const town = el('div', 'town')
    const progress = getProgress()
    const cases = gradeCases(progress.grade)
    const doneCount = cases.filter((c) => progress.completedCases.includes(c.id)).length
    if (cases.length > 0) {
      town.append(
        el(
          'div',
          'town-progress',
          `${COUNT_WORD[doneCount]} of ${COUNT_WORD[cases.length]} mysteries closed`,
        ),
      )
    }
    let nextAssigned = false
    for (const def of cases) {
      const done = progress.completedCases.includes(def.id)
      const card = el('button', `case-card ${done ? 'done' : ''} ${!done && !nextAssigned ? 'next' : ''}`)
      if (!done && !nextAssigned) {
        card.append(el('span', 'case-card-hint', 'start here'))
        nextAssigned = true
      }
      card.append(el('span', 'case-card-title', def.titleNoDigits))
      card.append(el('span', 'case-card-group', def.kidLabel))
      if (done) card.append(el('span', 'case-card-badge', 'solved'))
      card.addEventListener('click', () => {
        breakDue = false
        runCase(stage, def, {
          onBadge: (badge) => {
            updateProgress((p) =>
              p.badges.includes(badge)
                ? { ...p, completedCases: [...new Set([...p.completedCases, def.id])] }
                : { ...p, badges: [...p.badges, badge], completedCases: [...new Set([...p.completedCases, def.id])] },
            )
            sessionSolves++
            if (sessionSolves === 3) breakDue = true
          },
          onDone: () => render(),
        })
      })
      town.append(card)
    }
    stage.append(town)
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
