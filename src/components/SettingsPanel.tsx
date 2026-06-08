import { DiscordButton } from './DiscordButton'
import type { OutputFormat } from '../types'

interface SettingsPanelProps {
  inputDir: string
  outputDir: string
  recursive: boolean
  stripExif: boolean
  overwrite: boolean
  outputFormat: OutputFormat
  workerCount: string
  disabled: boolean
  onInputDirChange: (value: string) => void
  onOutputDirChange: (value: string) => void
  onRecursiveChange: (value: boolean) => void
  onStripExifChange: (value: boolean) => void
  onOverwriteChange: (value: boolean) => void
  onOutputFormatChange: (value: OutputFormat) => void
  onWorkerCountChange: (value: string) => void
  onBrowseInput: () => void
  onBrowseOutput: () => void
}

export function SettingsPanel({
  inputDir,
  outputDir,
  recursive,
  stripExif,
  overwrite,
  outputFormat,
  workerCount,
  disabled,
  onInputDirChange,
  onOutputDirChange,
  onRecursiveChange,
  onStripExifChange,
  onOverwriteChange,
  onOutputFormatChange,
  onWorkerCountChange,
  onBrowseInput,
  onBrowseOutput
}: SettingsPanelProps) {
  return (
    <section className="section-card">
      <h2 className="section-title">Настройки</h2>

      <div className="field-row">
        <span className="field-label">Исходная папка</span>
        <input
          className="discord-input"
          value={inputDir}
          placeholder="Выберите папку с фотографиями"
          onChange={(event) => onInputDirChange(event.target.value)}
          disabled={disabled}
        />
        <DiscordButton variant="secondary" onClick={onBrowseInput} disabled={disabled}>
          Обзор
        </DiscordButton>
      </div>

      <div className="field-row">
        <span className="field-label">Папка результата</span>
        <input
          className="discord-input"
          value={outputDir}
          placeholder="По умолчанию: исходная/compressed"
          onChange={(event) => onOutputDirChange(event.target.value)}
          disabled={disabled}
        />
        <DiscordButton variant="secondary" onClick={onBrowseOutput} disabled={disabled}>
          Обзор
        </DiscordButton>
      </div>

      <div className="options-row">
        <label className="option-inline">
          <input
            type="checkbox"
            checked={recursive}
            onChange={(event) => onRecursiveChange(event.target.checked)}
            disabled={disabled}
          />
          Подпапки
        </label>
        <label className="option-inline">
          <input
            type="checkbox"
            checked={stripExif}
            onChange={(event) => onStripExifChange(event.target.checked)}
            disabled={disabled}
          />
          Удалить EXIF
        </label>
        <label className="option-inline">
          <input
            type="checkbox"
            checked={overwrite}
            onChange={(event) => onOverwriteChange(event.target.checked)}
            disabled={disabled}
          />
          Перезаписать
        </label>
      </div>

      <div className="controls-row" style={{ marginTop: 12 }}>
        <div className="control-group">
          <label htmlFor="output-format">Формат выхода</label>
          <select
            id="output-format"
            className="discord-select"
            value={outputFormat}
            onChange={(event) => onOutputFormatChange(event.target.value as OutputFormat)}
            disabled={disabled}
          >
            <option value="original">Как исходный</option>
            <option value="jpeg">Всегда JPEG</option>
            <option value="webp">Всегда WebP</option>
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="worker-count">Потоки</label>
          <select
            id="worker-count"
            className="discord-select"
            value={workerCount}
            onChange={(event) => onWorkerCountChange(event.target.value)}
            disabled={disabled}
          >
            <option value="auto">Авто</option>
            <option value="2">2</option>
            <option value="4">4</option>
            <option value="8">8</option>
            <option value="12">12</option>
            <option value="16">16</option>
          </select>
        </div>
      </div>
    </section>
  )
}
