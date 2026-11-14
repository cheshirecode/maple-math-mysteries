import { el, speak } from '../voice.ts'
import { emptyProgress, getProgress, migrate, setProgress, updateProgress } from '../state.ts'
import { hasCode, getCodeRecord, setCodeRecord, eraseAll, saveProgress } from '../save/store.ts'
import { deriveCodeHash, newSalt, verifyCodeHash } from '../save/code.ts'
import { buildSaveText, decodeSaveText } from '../save/string.ts'
import { gradeCases } from '../grades.ts'

let unlocked = false

export function openParentView(root: HTMLElement, back: () => void): void {
  root.innerHTML = ''
  const view = el('div', 'parent')
  view.append(el('h2', 'parent-title', 'Parent view'))
  const close = el('button', 'btn', 'Back to the map')
  close.addEventListener('click', back)
  view.append(close)

  if (!hasCode()) {
    const form = el('div', 'parent-form')
    form.append(el('p', '', 'Set an access code. It guards this parent view, including import and export.'))
    const a = el('input', 'parent-code') as HTMLInputElement
    a.type = 'password'
    a.placeholder = 'access code'
    const b = el('input', 'parent-code') as HTMLInputElement
    b.type = 'password'
    b.placeholder = 'repeat access code'
    const set = el('button', 'btn', 'Set access code')
    const msg = el('p', 'parent-msg', '')
    set.addEventListener('click', async () => {
      if (!a.value || a.value !== b.value) {
        msg.textContent = 'The two entries do not match.'
        return
      }
      const salt = newSalt()
      const hash = await deriveCodeHash(a.value, salt)
      setCodeRecord(salt, hash)
      unlocked = true
      msg.textContent = 'Access code saved.'
      setTimeout(() => openParentView(root, back), 400)
    })
    form.append(a, b, set, msg)
    view.append(form)
    root.append(view)
    return
  }

  if (!unlocked) {
    const form = el('div', 'parent-form')
    form.append(el('p', '', 'Enter the access code.'))
    const input = el('input', 'parent-code') as HTMLInputElement
    input.type = 'password'
    const enter = el('button', 'btn', 'Unlock')
    const msg = el('p', 'parent-msg', '')
    enter.addEventListener('click', async () => {
      const rec = getCodeRecord()
      if (rec && (await verifyCodeHash(input.value, rec.salt, rec.hash))) {
        unlocked = true
        openParentView(root, back)
      } else {
        msg.textContent = 'Wrong code. Nothing changed.'
      }
    })
    form.append(input, enter, msg)
    view.append(form)
    root.append(view)
    return
  }

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

  const digits = el('button', 'btn', progress.showDigitsDefault ? 'Digits default: on' : 'Digits default: off')
  digits.addEventListener('click', () => {
    updateProgress((p) => ({ ...p, showDigitsDefault: !p.showDigitsDefault }))
    openParentView(root, back)
  })
  view.append(digits)

  const exportBox = el('div', 'parent-box')
  exportBox.append(el('h3', '', 'Export progress'))
  const exportText = el('textarea', 'parent-io') as HTMLTextAreaElement
  exportText.readOnly = true
  const exportMsg = el('p', 'parent-msg', '')
  const exportBtn = el('button', 'btn', 'Build save-string')
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
  importBox.append(el('h3', '', 'Import progress'))
  const importText = el('textarea', 'parent-io') as HTMLTextAreaElement
  importText.placeholder = 'paste a save-string here'
  const importBtn = el('button', 'btn', 'Import')
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
  danger.append(el('h3', '', 'Forgot the code?'))
  const reset = el('button', 'btn btn-danger', 'Erase all local data')
  reset.addEventListener('click', () => {
    eraseAll()
    unlocked = false
    setProgress(emptyProgress())
    speak('Local data erased.')
    openParentView(root, back)
  })
  danger.append(reset, el('p', '', 'This erases progress and the access code. Import a save-string to restore.'))
  view.append(danger)

  root.append(view)
}
