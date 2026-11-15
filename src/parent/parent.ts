import { el } from '../voice.ts'
import { emptyProgress, getProgress, setProgress } from '../state.ts'
import { eraseAll } from '../save/store.ts'
import { buildSaveText } from '../save/string.ts'
import { importSaveText } from '../save/import.ts'
import { gradeCases } from '../grades.ts'
import qrcode from '../lib/qrcode.js'
import { isMuted, setMuted } from '../sfx.ts'
import { isVoiceOff, setVoiceOff } from '../voice.ts'
import { handoffUrl } from './handoff.ts'

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

  const soundBtn = el('button', 'btn btn-ghost btn-small', isMuted() ? 'Sounds: off' : 'Sounds: on')
  soundBtn.addEventListener('click', () => {
    setMuted(!isMuted())
    soundBtn.textContent = isMuted() ? 'Sounds: off' : 'Sounds: on'
  })
  const voiceBtn = el('button', 'btn btn-ghost btn-small', isVoiceOff() ? 'Voice: off' : 'Voice: on')
  voiceBtn.addEventListener('click', () => {
    setVoiceOff(!isVoiceOff())
    voiceBtn.textContent = isVoiceOff() ? 'Voice: off' : 'Voice: on'
  })
  const toggles = el('div', 'parent-toggles')
  toggles.append(soundBtn, voiceBtn)
  view.append(toggles)

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
    const nav = navigator as Navigator & { share?: (d: { text?: string; url?: string }) => Promise<void> }
    if (!nav.share) {
      exportMsg.textContent = 'Share is not here. Use Copy or Download.'
      return
    }
    try {
      // The query string is the share: the recipient opens the site with the
      // code attached and gets the same confirmation as a scanned QR.
      await nav.share({ title: 'Maple Math Mysteries', url: handoffUrl(exportText.value) })
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
  const qrBtn = el('button', 'btn', 'Show QR')
  const qrBox = el('div', 'parent-qr')
  qrBtn.addEventListener('click', async () => {
    let text = exportText.value
    if (!text) {
      const result = await buildSaveText(getProgress())
      text = result.text
      exportText.value = text
      exportText.dataset.compressed = String(result.compressed)
    }
    qrBox.innerHTML = ''
    const url = handoffUrl(text)
    const qr = qrcode(0, 'M')
    qr.addData(url)
    qr.make()
    const count = qr.getModuleCount()
    const canvas = document.createElement('canvas')
    const cell = 4
    canvas.width = count * cell
    canvas.height = count * cell
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.fillStyle = '#fffdf6'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = '#2b2622'
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qr.isDark(row, col)) ctx.fillRect(col * cell, row * cell, cell, cell)
      }
    }
    qrBox.append(canvas, el('p', 'parent-msg', 'Scan with a phone camera. It opens this page with the code.'))
  })
  exportBox.append(exportBtn, exportText, copyBtn, shareBtn, download, qrBtn, qrBox, exportMsg)
  view.append(exportBox)

  const importBox = el('div', 'parent-box')
  importBox.append(el('h3', '', 'Load a save code'))
  const importText = el('textarea', 'parent-io') as HTMLTextAreaElement
  importText.placeholder = 'paste a save code here'
  const importBtn = el('button', 'btn', 'Load code')
  const importMsg = el('p', 'parent-msg', '')
  importBtn.addEventListener('click', async () => {
    try {
      await importSaveText(importText.value)
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
