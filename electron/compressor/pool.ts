import { cpus } from 'os'
import { Worker } from 'worker_threads'
import { join } from 'path'
import type { BrowserWindow } from 'electron'
import type { CompressionOptions, DoneEvent, LogEvent, ProgressEvent } from '../../src/types'
import { scanImages } from './scanner'

interface WorkerResult {
  ok: boolean
  src: string
  dst?: string
  skipped?: boolean
  bytesBefore?: number
  bytesAfter?: number
  error?: string
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function resolveWorkerCount(workerCount: CompressionOptions['workerCount']): number {
  const cpuCount = Math.max(1, cpus().length)
  if (workerCount === 'auto') {
    return cpuCount
  }
  return Math.max(1, Math.min(workerCount, cpuCount * 2))
}

export class CompressionPool {
  private cancelled = false
  private running = false
  private activeWorkers = 0

  constructor(private readonly getWindow: () => BrowserWindow | null) {}

  isRunning(): boolean {
    return this.running
  }

  async start(options: CompressionOptions): Promise<void> {
    if (this.running) {
      throw new Error('Сжатие уже выполняется')
    }

    this.cancelled = false
    this.running = true

    const files = await scanImages(options.inputDir, options.recursive)
    const total = files.length
    const workerCount = resolveWorkerCount(options.workerCount)
    const workerPath = join(__dirname, 'worker.js')

    let processed = 0
    let savedBytes = 0
    let nextIndex = 0
    const startedAt = Date.now()

    const sendProgress = (): void => {
      const elapsedSeconds = Math.max((Date.now() - startedAt) / 1000, 0.001)
      const speed = processed / elapsedSeconds
      const remaining = Math.max(total - processed, 0)
      const etaSeconds = speed > 0 ? remaining / speed : 0

      const payload: ProgressEvent = {
        processed,
        total,
        speed,
        etaSeconds
      }

      this.getWindow()?.webContents.send('compression:progress', payload)
    }

    const sendLog = (event: LogEvent): void => {
      this.getWindow()?.webContents.send('compression:log', event)
    }

    const sendDone = (payload: DoneEvent): void => {
      this.getWindow()?.webContents.send('compression:done', payload)
    }

    if (total === 0) {
      sendLog({ type: 'info', message: 'Изображения не найдены в выбранной папке' })
      sendDone({ processed: 0, total: 0, savedBytes: 0, cancelled: false })
      this.running = false
      return
    }

    sendLog({
      type: 'info',
      message: `Найдено ${total} файлов, потоков: ${workerCount}`
    })

    await new Promise<void>((resolve) => {
      const launchNext = (): void => {
        if (this.cancelled) {
          if (this.activeWorkers === 0) {
            sendDone({
              processed,
              total,
              savedBytes,
              cancelled: true
            })
            resolve()
          }
          return
        }

        while (this.activeWorkers < workerCount && nextIndex < total) {
          const src = files[nextIndex]
          nextIndex += 1
          this.activeWorkers += 1

          const worker = new Worker(workerPath, {
            workerData: { src, options }
          })

          worker.on('message', (result: WorkerResult) => {
            processed += 1

            if (result.ok) {
              if (result.skipped) {
                sendLog({
                  type: 'skip',
                  message: `Пропуск (уже существует): ${result.src}`,
                  src: result.src,
                  bytesBefore: result.bytesBefore,
                  bytesAfter: result.bytesAfter
                })
              } else if (result.bytesBefore !== undefined && result.bytesAfter !== undefined) {
                savedBytes += Math.max(result.bytesBefore - result.bytesAfter, 0)
                sendLog({
                  type: 'success',
                  message: `${result.src}  ${formatBytes(result.bytesBefore)} → ${formatBytes(result.bytesAfter)}`,
                  src: result.src,
                  bytesBefore: result.bytesBefore,
                  bytesAfter: result.bytesAfter
                })
              }
            } else {
              sendLog({
                type: 'error',
                message: result.error ?? 'Ошибка обработки',
                src: result.src
              })
            }

            sendProgress()
          })

          worker.on('error', (error) => {
            processed += 1
            sendLog({
              type: 'error',
              message: error.message,
              src
            })
            sendProgress()
          })

          worker.on('exit', () => {
            this.activeWorkers -= 1

            if (nextIndex >= total && this.activeWorkers === 0) {
              if (!this.cancelled) {
                sendDone({
                  processed,
                  total,
                  savedBytes,
                  cancelled: false
                })
              }
              resolve()
              return
            }

            launchNext()
          })
        }
      }

      launchNext()
    })

    this.running = false
    this.cancelled = false
  }

  cancel(): void {
    this.cancelled = true
  }
}
