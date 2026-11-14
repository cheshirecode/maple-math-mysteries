import { CURRENT_SCHEMA } from '../state.ts'

const CRC_TABLE: number[] = (() => {
  const table: number[] = []
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    table[n] = c >>> 0
  }
  return table
})()

export function crc32(bytes: Uint8Array): number {
  let crc = 0xffffffff
  for (let i = 0; i < bytes.length; i++) crc = CRC_TABLE[(crc ^ bytes[i]) & 0xff] ^ (crc >>> 8)
  return (crc ^ 0xffffffff) >>> 0
}

export function toBase64Url(bytes: Uint8Array): string {
  let s = ''
  for (const b of bytes) s += String.fromCharCode(b)
  return btoa(s).replaceAll('+', '-').replaceAll('/', '_').replace(/=+$/, '')
}

export function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replaceAll('-', '+').replaceAll('_', '/')
  const padded = b64 + '='.repeat((4 - (b64.length % 4)) % 4)
  const raw = atob(padded)
  const out = new Uint8Array(raw.length)
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

type CompressionCtor = new (format: string) => ReadableWritablePair<unknown, Uint8Array>

interface StreamHolder {
  CompressionStream?: CompressionCtor
  DecompressionStream?: CompressionCtor
}

async function pipeBytes(bytes: Uint8Array, ctor: CompressionCtor): Promise<Uint8Array> {
  const stream = new ctor('deflate-raw')
  const blob = new Blob([bytes as BlobPart]).stream().pipeThrough(stream)
  const buf = await new Response(blob).arrayBuffer()
  return new Uint8Array(buf)
}

async function compress(bytes: Uint8Array): Promise<Uint8Array> {
  const ctor = (globalThis as StreamHolder).CompressionStream
  if (!ctor) throw new Error('no CompressionStream')
  return pipeBytes(bytes, ctor)
}

async function decompress(bytes: Uint8Array): Promise<Uint8Array> {
  const ctor = (globalThis as StreamHolder).DecompressionStream
  if (!ctor) throw new Error('no DecompressionStream')
  return pipeBytes(bytes, ctor)
}

function encodeText(p: unknown): Uint8Array {
  return new TextEncoder().encode(JSON.stringify(p))
}

export interface SaveResult {
  payload: Uint8Array
  text: string
  compressed: boolean
}

export async function buildSaveText(progress: unknown, version = 1): Promise<SaveResult> {
  const raw = encodeText(progress)
  let payload: Uint8Array
  let compressed = true
  try {
    payload = await compress(raw)
  } catch {
    payload = raw
    compressed = false
  }
  const text = `MDA1.${version}.${crc32(payload).toString(16)}.${toBase64Url(payload)}`
  return { payload, text, compressed }
}

export interface DecodedSave {
  version: number
  progress: unknown
  raw: Uint8Array
}

export async function decodeSaveText(text: string): Promise<DecodedSave> {
  const parts = text.trim().split('.')
  if (parts.length !== 4 || parts[0] !== 'MDA1') throw new Error('bad save-string shape')
  const version = Number(parts[1])
  if (!Number.isInteger(version) || version < 1) throw new Error('bad save-string version')
  if (version > CURRENT_SCHEMA) throw new Error('unsupported save-string version')
  const payload = fromBase64Url(parts[3])
  if (crc32(payload) !== Number.parseInt(parts[2], 16)) throw new Error('save-string checksum mismatch')
  let raw: Uint8Array
  if (payload[0] === 0x7b) {
    raw = payload
  } else {
    raw = await decompress(payload)
  }
  const progress: unknown = JSON.parse(new TextDecoder().decode(raw))
  return { version, progress, raw }
}
