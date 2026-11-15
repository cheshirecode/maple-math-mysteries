import { decodeSaveText } from './string.ts'
import { migrate, setProgress } from '../state.ts'
import { saveProgress } from './store.ts'

// Shared import path for every handoff surface (paste, QR, future payloads).
// Room for extension lives here, not in the UI modules.
export async function importSaveText(text: string): Promise<void> {
  const decoded = await decodeSaveText(text)
  if (decoded.version !== 1) throw new Error('unsupported version')
  const next = migrate(decoded.progress)
  setProgress(next)
  saveProgress(next)
}
