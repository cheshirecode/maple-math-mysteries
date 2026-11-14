import { el } from './voice.ts'
import { getProgress, migrate, updateProgress, subscribe } from './state.ts'
import { loadProgress, saveProgress } from './save/store.ts'
import { runCase } from './engine/run.ts'
import { GRADES, gradeCases, gradeWord, isGradeActive } from './grades.ts'
import { openParentView } from './parent/parent.ts'
import './style.css'

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
    updateProgress(() => ({ ...restored, digitsMode: restored.showDigitsDefault }))
  }

  const header = el('header', 'topbar')
  const brand = el('h1', 'brand', 'Maple Math Mysteries')
  header.append(brand)

  const picker = el('div', 'grade-picker')
  picker.setAttribute('role', 'group')
  picker.setAttribute('aria-label', 'Grade')
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
        b.tabIndex = -1
        b.title = 'Coming soon'
        b.dataset.soon = 'true'
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
  header.append(picker)

  const digitsBtn = el('button', 'btn btn-digits', 'show digits')
  digitsBtn.addEventListener('click', () => {
    updateProgress((p) => ({ ...p, digitsMode: !p.digitsMode }))
    render()
  })
  header.append(digitsBtn)
  const parentBtn = el('button', 'btn btn-ghost', 'parent')
  parentBtn.addEventListener('click', () => openParentView(main, () => render()))
  header.append(parentBtn)
  root.append(header)

  const main = el('main', 'town')
  root.append(main)

  const render = () => {
    document.body.dataset.digitsMode = String(getProgress().digitsMode)
    digitsBtn.textContent = getProgress().digitsMode ? 'hide digits' : 'show digits'
    renderPicker()
    main.innerHTML = ''
    const progress = getProgress()
    let nextAssigned = false
    for (const def of gradeCases(progress.grade)) {
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
        runCase(main, def, {
          onBadge: (badge) => {
            updateProgress((p) =>
              p.badges.includes(badge)
                ? { ...p, completedCases: [...new Set([...p.completedCases, def.id])] }
                : { ...p, badges: [...p.badges, badge], completedCases: [...new Set([...p.completedCases, def.id])] },
            )
          },
          onDone: () => render(),
        })
      })
      main.append(card)
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
