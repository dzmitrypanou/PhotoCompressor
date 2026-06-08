import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import pngToIco from 'png-to-ico'
import sharp from 'sharp'

const projectRoot = process.cwd()
const sourcePath = join(projectRoot, 'resources', 'icon-source.png')
const resourcesDir = join(projectRoot, 'resources')
const iconPngPath = join(resourcesDir, 'icon.png')
const iconIcoPath = join(resourcesDir, 'icon.ico')

const icoSizes = [16, 24, 32, 48, 64, 128, 256]

await mkdir(resourcesDir, { recursive: true })

await sharp(sourcePath)
  .resize(512, 512, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png()
  .toFile(iconPngPath)

const pngBuffers = await Promise.all(
  icoSizes.map((size) =>
    sharp(sourcePath)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toBuffer()
  )
)

const icoBuffer = await pngToIco(pngBuffers)
await writeFile(iconIcoPath, icoBuffer)

console.log(`Created ${iconPngPath}`)
console.log(`Created ${iconIcoPath}`)
