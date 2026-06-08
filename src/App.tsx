import { useMemo, useState } from 'react'
import { getDefaultOutputDir } from '../shared/paths'
import { Sidebar } from './components/Sidebar'
import { SettingsPanel } from './components/SettingsPanel'
import { ProgressSection } from './components/ProgressSection'
import { LogPanel } from './components/LogPanel'
import { DiscordButton } from './components/DiscordButton'
import { useCompression } from './hooks/useCompression'
import type { CompressionOptions, OutputFormat, PresetId } from './types'

export default function App() {
  const [presetId, setPresetId] = useState<PresetId>('balanced')
  const [inputDir, setInputDir] = useState('')
  const [outputDir, setOutputDir] = useState('')
  const [recursive, setRecursive] = useState(true)
  const [stripExif, setStripExif] = useState(true)
  const [overwrite, setOverwrite] = useState(false)
  const [outputFormat, setOutputFormat] = useState<OutputFormat>('original')
  const [workerCount, setWorkerCount] = useState('auto')

  const { progress, logs, running, begin } = useCompression()

  const resolvedOutputDir = useMemo(() => {
    if (outputDir.trim()) {
      return outputDir.trim()
    }
    if (inputDir.trim()) {
      return getDefaultOutputDir(inputDir.trim())
    }
    return ''
  }, [inputDir, outputDir])

  const browseInput = async (): Promise<void> => {
    const folder = await window.api.selectFolder()
    if (!folder) return
    setInputDir(folder)
    if (!outputDir.trim()) {
      setOutputDir(getDefaultOutputDir(folder))
    }
  }

  const browseOutput = async (): Promise<void> => {
    const folder = await window.api.selectFolder()
    if (!folder) return
    setOutputDir(folder)
  }

  const startCompression = async (): Promise<void> => {
    if (!inputDir.trim()) {
      return
    }

    const options: CompressionOptions = {
      inputDir: inputDir.trim(),
      outputDir: resolvedOutputDir,
      presetId,
      recursive,
      stripExif,
      overwrite,
      outputFormat,
      workerCount: workerCount === 'auto' ? 'auto' : Number(workerCount)
    }

    begin()
    await window.api.startCompression(options)
  }

  const cancelCompression = async (): Promise<void> => {
    await window.api.cancelCompression()
  }

  return (
    <div className="app-layout">
      <Sidebar selectedPreset={presetId} onSelectPreset={setPresetId} />

      <div className="main-panel">
        <header className="main-header">Сжатие фотографий</header>

        <div className="main-content">
          <SettingsPanel
            inputDir={inputDir}
            outputDir={outputDir}
            recursive={recursive}
            stripExif={stripExif}
            overwrite={overwrite}
            outputFormat={outputFormat}
            workerCount={workerCount}
            disabled={running}
            onInputDirChange={setInputDir}
            onOutputDirChange={setOutputDir}
            onRecursiveChange={setRecursive}
            onStripExifChange={setStripExif}
            onOverwriteChange={setOverwrite}
            onOutputFormatChange={setOutputFormat}
            onWorkerCountChange={setWorkerCount}
            onBrowseInput={browseInput}
            onBrowseOutput={browseOutput}
          />

          <ProgressSection
            processed={progress.processed}
            total={progress.total}
            speed={progress.speed}
            etaSeconds={progress.etaSeconds}
            running={running}
          />

          <LogPanel logs={logs} />

          <div className="actions-row">
            <DiscordButton variant="secondary" onClick={cancelCompression} disabled={!running}>
              Отмена
            </DiscordButton>
            <DiscordButton
              variant="primary"
              onClick={startCompression}
              disabled={running || !inputDir.trim()}
            >
              Начать сжатие
            </DiscordButton>
          </div>
        </div>
      </div>
    </div>
  )
}
