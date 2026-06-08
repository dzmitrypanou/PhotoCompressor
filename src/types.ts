export type PresetId = 'maximum' | 'high' | 'balanced' | 'web' | 'aggressive'

export type OutputFormat = 'original' | 'jpeg' | 'webp'

export interface CompressionOptions {
  inputDir: string
  outputDir: string
  presetId: PresetId
  recursive: boolean
  stripExif: boolean
  overwrite: boolean
  outputFormat: OutputFormat
  workerCount: number | 'auto'
}

export interface ProgressEvent {
  processed: number
  total: number
  speed: number
  etaSeconds: number
}

export interface LogEvent {
  type: 'success' | 'error' | 'skip' | 'info'
  message: string
  src?: string
  bytesBefore?: number
  bytesAfter?: number
}

export interface DoneEvent {
  processed: number
  total: number
  savedBytes: number
  cancelled: boolean
}

export interface PhotoCompressorApi {
  selectFolder: () => Promise<string | null>
  startCompression: (options: CompressionOptions) => Promise<void>
  cancelCompression: () => Promise<void>
  onProgress: (callback: (event: ProgressEvent) => void) => () => void
  onLog: (callback: (event: LogEvent) => void) => () => void
  onDone: (callback: (event: DoneEvent) => void) => () => void
}

declare global {
  interface Window {
    api: PhotoCompressorApi
  }
}
