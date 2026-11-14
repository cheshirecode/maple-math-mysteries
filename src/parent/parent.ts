import { el } from '../voice.ts'
import { emptyProgress, getProgress, migrate, setProgress } from '../state.ts'
import { eraseAll, saveProgress } from '../save/store.ts'
import { buildSaveText, decodeSaveText } from '../save/string.ts'
import { gradeCases } from '../grades.ts'

export function openParentView(root: HTMLElement, back: () => void): void {
  root.innerHTML = ''
  const view = el('div', 'parent')
  view.append(el('h2', 'parent-title', 'Parent view'))
  const close = el('button', 'btn', 'Back to the map')
  close.addEventListener('click', back)
  view.append(close)

  const progress = getProgress()
  const groups = new Set(
    gradeCases(progress.grade)
      .filter((c) => progress.completedCases.includes(c.id))
      .map((c) => c.group),
  )
  const stats = el('div', 'parent-stats')
  stats.append(el('p', '', `Minutes played: ${progress.minutesPlayed}`))
  stats.append(el('p', '', `Cases solved: ${progress.completedCases.length}`))
  stats.append(el('p', '', `Groups covered: ${[...groups].join(', ') || 'none yet'}`))
  view.append(stats)

  const exportBox = el('div', 'parent-box')
  exportBox.append(el('h3', '', 'Save code'))
  const exportText = el('textarea', 'parent-io') as HTMLTextAreaElement
  exportText.readOnly = true
  const exportMsg = el('p', 'parent-msg', '')
  const exportBtn = el('button', 'btn', 'Build save code')
  const copyBtn = el('button', 'btn', 'Copy string')
  const shareBtn = el('button', 'btn', 'Share')
  const download = el('button', 'btn', 'Download file')
  exportBtn.addEventListener('click', async () => {
    const result = await buildSaveText(getProgress())
    exportText.value = result.text
    exportText.dataset.compressed = String(result.compressed)
  })
  copyBtn.addEventListener('click', async () => {
    if (!exportText.value) return
    try {
      await navigator.clipboard.writeText(exportText.value)
      exportMsg.textContent = 'Copied. Paste it on the other device.'
    } catch {
      exportMsg.textContent = 'Copy blocked. Select the text and copy by hand.'
    }
  })
  shareBtn.addEventListener('click', async () => {
    if (!exportText.value) return
    const nav = navigator as Navigator & { share?: (d: { text: string }) => Promise<void> }
    if (!nav.share) {
      exportMsg.textContent = 'Share is not here. Use Copy or Download.'
      return
    }
    try {
      await nav.share({ text: exportText.value })
    } catch {
      exportMsg.textContent = 'Share closed.'
    }
  })
  download.addEventListener('click', () => {
    if (!exportText.value) return
    const blob = new Blob([exportText.value], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const link = el('a') as HTMLAnchorElement
    link.href = url
    link.download = 'mmm-save.txt'
    link.click()
    URL.revokeObjectURL(url)
  })
  exportBox.append(exportBtn, exportText, copyBtn, shareBtn, download, exportMsg)
  view.append(exportBox)

  const importBox = el('div', 'parent-box')
  importBox.append(el('h3', '', 'Load a save code'))
  const importText = el('textarea', 'parent-io') as HTMLTextAreaElement
  importText.placeholder = 'paste a save code here'
  const importBtn = el('button', 'btn', 'Load code')
  const importMsg = el('p', 'parent-msg', '')
  importBtn.addEventListener('click', async () => {
    try {
      const decoded = await decodeSaveText(importText.value)
      if (decoded.version !== 1) throw new Error('unsupported version')
      const next = migrate(decoded.progress)
      setProgress(next)
      saveProgress(next)
      importMsg.textContent = 'Progress imported and saved.'
    } catch (err) {
      importMsg.textContent = `Import failed: ${err instanceof Error ? err.message : 'bad string'}`
    }
  })
  importBox.append(importBtn, importText, importMsg)
  view.append(importBox)

  const danger = el('div', 'parent-box parent-danger')
  danger.append(el('h3', '', 'Start fresh'))
  const reset = el('button', 'btn btn-danger', 'Erase all local data')
  reset.addEventListener('click', () => {
    eraseAll()
    setProgress(emptyProgress())
    openParentView(root, back)
  })
  danger.append(reset, el('p', '', 'This erases progress on this device. A save code restores it.'))
  view.append(danger)

  root.append(view)
}
