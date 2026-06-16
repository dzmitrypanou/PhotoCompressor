import { parentPort, workerData } from 'worker_threads'
import { mkdir, stat } from 'fs/promises'
import { dirname, extname, join, relative } from 'path'
import sharp from 'sharp'
import type { CompressionOptions } from '../../src/types'
import { getPreset } from '../../shared/presets'
import { fileIsNewer } from './scanner'

interface WorkerJob {
  src: string
  options: CompressionOptions
}

interface WorkerResult {
  ok: boolean
  src: string
  dst?: string
  skipped?: boolean
  bytesBefore?: number
  bytesAfter?: number
  error?: string
}

type OutputKind = 'jpeg' | 'webp' | 'png'

function resolveOutputKind(
  src: string,
  outputFormat: CompressionOptions['outputFormat']
): OutputKind {
  if (outputFormat === 'jpeg') return 'jpeg'
  if (outputFormat === 'webp') return 'webp'

  const ext = extname(src).toLowerCase()
  if (ext === '.webp') return 'webp'
  if (ext === '.png') return 'png'
  return 'jpeg'
}

function outputExtension(kind: OutputKind): string {
  if (kind === 'webp') return '.webp'
  if (kind === 'png') return '.png'
  return '.jpg'
}

async function hasAlphaChannel(src: string): Promise<boolean> {
  const metadata = await sharp(src, { failOn: 'none' }).metadata()
  return metadata.hasAlpha === true
}

async function compressFile(job: WorkerJob): Promise<WorkerResult> {
  const { src, options } = job
  const preset = getPreset(options.presetId)

  const relativePath = relative(options.inputDir, src)
  const outputKind = resolveOutputKind(src, options.outputFormat)

  if (outputKind === 'jpeg' && (await hasAlphaChannel(src))) {
    return {
      ok: false,
      src,
      error: 'PNG с прозрачностью нельзя сохранить в JPEG — выберите WebP'
    }
  }

  const relativeWithoutExt = relativePath.slice(0, relativePath.length - extname(relativePath).length)
  const dst = join(options.outputDir, `${relativeWithoutExt}${outputExtension(outputKind)}`)

  const sourceStat = await stat(src)
  const bytesBefore = sourceStat.size

  if (!options.overwrite && (await fileIsNewer(dst, src))) {
    const targetStat = await stat(dst)
    return {
      ok: true,
      src,
      dst,
      skipped: true,
      bytesBefore,
      bytesAfter: targetStat.size
    }
  }

  await mkdir(dirname(dst), { recursive: true })

  let pipeline = sharp(src, { failOn: 'none' })

  if (options.stripExif) {
    pipeline = pipeline.rotate()
  }

  if (preset.maxSide) {
    pipeline = pipeline.resize(preset.maxSide, preset.maxSide, {
      fit: 'inside',
      withoutEnlargement: true
    })
  }

  if (outputKind === 'jpeg') {
    pipeline = pipeline.jpeg({
      quality: preset.jpegQuality,
      mozjpeg: true,
      progressive: preset.progressive
    })
  } else if (outputKind === 'webp') {
    pipeline = pipeline.webp({
      quality: preset.webpQuality,
      effort: 4
    })
  } else {
    pipeline = pipeline.png({
      quality: preset.jpegQuality,
      compressionLevel: 9,
      palette: preset.id === 'aggressive'
    })
  }

  if (options.stripExif) {
    await pipeline.toFile(dst)
  } else {
    await pipeline.withMetadata().toFile(dst)
  }

  const targetStat = await stat(dst)

  return {
    ok: true,
    src,
    dst,
    bytesBefore,
    bytesAfter: targetStat.size
  }
}

if (parentPort) {
  const job = workerData as WorkerJob

  compressFile(job)
    .then((result) => parentPort?.postMessage(result))
    .catch((error: unknown) => {
      const message = error instanceof Error ? error.message : 'Неизвестная ошибка'
      parentPort?.postMessage({
        ok: false,
        src: job.src,
        error: message
      } satisfies WorkerResult)
    })
}
