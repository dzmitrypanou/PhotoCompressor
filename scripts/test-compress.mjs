import { mkdir, rm, stat, writeFile } from 'fs/promises'
import { join } from 'path'
import { Worker } from 'worker_threads'
import sharp from 'sharp'

const root = join(process.cwd(), 'test-fixtures')
const inputDir = join(root, 'input')
const outputDir = join(root, 'output')

async function createFixtures() {
  await rm(root, { recursive: true, force: true })
  await mkdir(inputDir, { recursive: true })

  const jpegPath = join(inputDir, 'sample.jpg')
  const pngPath = join(inputDir, 'sample.png')
  const webpPath = join(inputDir, 'sample.webp')
  const rgbaPath = join(inputDir, 'alpha.png')

  await sharp({
    create: { width: 2400, height: 1600, channels: 3, background: { r: 120, g: 80, b: 200 } }
  })
    .jpeg({ quality: 95 })
    .toFile(jpegPath)

  await sharp({
    create: { width: 1800, height: 1200, channels: 3, background: { r: 40, g: 180, b: 90 } }
  })
    .png()
    .toFile(pngPath)

  await sharp({
    create: { width: 1600, height: 900, channels: 3, background: { r: 220, g: 120, b: 40 } }
  })
    .webp({ quality: 95 })
    .toFile(webpPath)

  await sharp({
    create: { width: 800, height: 600, channels: 4, background: { r: 20, g: 20, b: 20, alpha: 0.5 } }
  })
    .png()
    .toFile(rgbaPath)

  return [jpegPath, pngPath, webpPath, rgbaPath]
}

function runWorker(src, options) {
  const workerPath = join(process.cwd(), 'out', 'main', 'worker.js')
  return new Promise((resolve, reject) => {
    const worker = new Worker(workerPath, { workerData: { src, options } })
    worker.on('message', resolve)
    worker.on('error', reject)
    worker.on('exit', (code) => {
      if (code !== 0) {
        reject(new Error(`Worker exited with code ${code}`))
      }
    })
  })
}

async function main() {
  await createFixtures()

  const options = {
    inputDir,
    outputDir,
    presetId: 'web',
    recursive: false,
    stripExif: true,
    overwrite: true,
    outputFormat: 'original',
    workerCount: 2
  }

  const files = ['sample.jpg', 'sample.png', 'sample.webp', 'alpha.png']
  const startedAt = Date.now()
  const results = []

  for (const file of files) {
    const result = await runWorker(join(inputDir, file), options)
    results.push(result)
  }

  const elapsed = (Date.now() - startedAt) / 1000
  let failures = 0

  for (const result of results) {
    if (!result.ok) {
      failures += 1
      console.error('FAIL:', result.src, result.error)
      continue
    }

    const outStat = await stat(result.dst)
    console.log(
      `OK: ${result.src} -> ${result.dst} (${result.bytesBefore} -> ${outStat.size} bytes)`
    )
  }

  const jpegToJpeg = results.find((item) => item.src.endsWith('sample.jpg'))
  const rgba = results.find((item) => item.src.endsWith('alpha.png'))

  if (!jpegToJpeg?.ok || !jpegToJpeg.bytesAfter || jpegToJpeg.bytesAfter >= jpegToJpeg.bytesBefore) {
    failures += 1
    console.error('FAIL: JPEG was not compressed')
  }

  if (!rgba?.ok || !rgba.dst?.endsWith('.png')) {
    failures += 1
    console.error('FAIL: RGBA PNG output missing')
  }

  console.log(`Processed ${results.length} files in ${elapsed.toFixed(2)}s`)

  if (failures > 0) {
    process.exit(1)
  }
}

main().catch((error) => {
  console.error(error)
  process.exit(1)
})
