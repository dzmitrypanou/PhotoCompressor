import { useEffect, useState } from 'react'
import type { DoneEvent, LogEvent, ProgressEvent } from '../types'

const initialProgress: ProgressEvent = {
  processed: 0,
  total: 0,
  speed: 0,
  etaSeconds: 0
}

export function useCompression() {
  const [progress, setProgress] = useState<ProgressEvent>(initialProgress)
  const [logs, setLogs] = useState<LogEvent[]>([])
  const [running, setRunning] = useState(false)
  const [doneInfo, setDoneInfo] = useState<DoneEvent | null>(null)

  useEffect(() => {
    const unsubscribeProgress = window.api.onProgress((event) => {
      setProgress(event)
    })

    const unsubscribeLog = window.api.onLog((event) => {
      setLogs((current) => [...current.slice(-499), event])
    })

    const unsubscribeDone = window.api.onDone((event) => {
      setRunning(false)
      setDoneInfo(event)
      setLogs((current) => [
        ...current,
        {
          type: 'info',
          message: event.cancelled
            ? `Отменено: обработано ${event.processed} из ${event.total}`
            : `Готово: ${event.processed} файлов, сэкономлено ${formatSaved(event.savedBytes)}`
        }
      ])
    })

    return () => {
      unsubscribeProgress()
      unsubscribeLog()
      unsubscribeDone()
    }
  }, [])

  const resetSession = (): void => {
    setProgress(initialProgress)
    setLogs([])
    setDoneInfo(null)
  }

  const begin = (): void => {
    setRunning(true)
    setDoneInfo(null)
    setProgress(initialProgress)
    setLogs([])
  }

  return {
    progress,
    logs,
    running,
    doneInfo,
    resetSession,
    begin
  }
}

function formatSaved(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}
