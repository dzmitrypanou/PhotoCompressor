interface ProgressSectionProps {
  processed: number
  total: number
  speed: number
  etaSeconds: number
  running: boolean
}

function formatEta(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds <= 0) {
    return '—'
  }

  if (seconds < 60) {
    return `${Math.ceil(seconds)} сек`
  }

  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = Math.ceil(seconds % 60)
  return `${minutes} мин ${remainingSeconds} сек`
}

export function ProgressSection({ processed, total, speed, etaSeconds, running }: ProgressSectionProps) {
  const percent = total > 0 ? Math.round((processed / total) * 100) : 0

  return (
    <section className="section-card progress-section">
      <h2 className="section-title">Прогресс</h2>
      <div className="progress-bar-track">
        <div className="progress-bar-fill" style={{ width: `${percent}%` }} />
      </div>
      <div className="progress-meta">
        <span>
          {processed} / {total} ({percent}%)
        </span>
        <span>
          {running ? `${speed.toFixed(1)} файл/сек · ETA ${formatEta(etaSeconds)}` : 'Ожидание запуска'}
        </span>
      </div>
    </section>
  )
}
