import type { LogEvent } from '../types'

interface LogPanelProps {
  logs: LogEvent[]
}

export function LogPanel({ logs }: LogPanelProps) {
  return (
    <section className="section-card" style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
      <h2 className="section-title">Лог</h2>
      <div className="log-panel">
        {logs.length === 0 ? (
          <div className="log-line info">Готов к работе. Выберите папку и нажмите «Начать сжатие».</div>
        ) : (
          logs.map((log, index) => (
            <div key={`${log.type}-${index}`} className={`log-line ${log.type}`}>
              {log.type === 'success' && '✓ '}
              {log.type === 'error' && '✗ '}
              {log.type === 'skip' && '↷ '}
              {log.message}
            </div>
          ))
        )}
      </div>
    </section>
  )
}
