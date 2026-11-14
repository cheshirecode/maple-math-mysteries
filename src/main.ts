import { el } from './voice.ts'
import { getProgress, migrate, updateProgress, subscribe } from './state.ts'
import { loadProgress, saveProgress } from './save/store.ts'
import { runCase } from './engine/run.ts'
import { CASES } from './cases/index.ts'
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
    navigator.serviceWorker.register('/sw.js').catch(() => undefined)
  }

  if (stored) {
    const restored = migrate(stored)
    updateProgress(() => ({ ...restored, digitsMode: restored.showDigitsDefault }))
  }

  const header = el('header', 'topbar')
  const brand = el('h1', 'brand', 'Maple Math Mysteries')
  header.append(brand)
  const digitsBtn = el('button', 'btn btn-digits', 'show digits')
  digitsBtn.addEventListener('click', () => {
    updateProgress((p) => ({ ...p, digitsMode: !p.digitsMode }))
    render(root)
  })
  header.append(digitsBtn)
  const parentBtn = el('button', 'btn btn-ghost', 'parent')
  parentBtn.addEventListener('click', () => openParentView(root, () => render(root)))
  header.append(parentBtn)
  root.append(header)

  const main = el('main', 'town')
  root.append(main)

  const render = (target: HTMLElement) => {
    // rerender handlers were bound with the latest render closure
    document.body.dataset.digitsMode = String(getProgress().digitsMode)
    digitsBtn.textContent = getProgress().digitsMode ? 'hide digits' : 'show digits'
    main.innerHTML = ''
    const progress = getProgress()
    for (const def of CASES) {
      const done = progress.completedCases.includes(def.id)
      const card = el('button', `case-card ${done ? 'done' : ''}`)
      card.append(el('span', 'case-card-title', def.titleNoDigits))
      card.append(el('span', 'case-card-group', def.group))
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
          onDone: () => render(root),
        })
      })
      main.append(card)
    }
  }

  render(root)

  setInterval(() => {
    if (document.visibilityState === 'visible') {
      updateProgress((p) => ({ ...p, minutesPlayed: p.minutesPlayed + 1 }))
    }
  }, 60000)
}

start()
