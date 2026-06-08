import { readdir, stat } from 'fs/promises'
import { join, extname } from 'path'

const SUPPORTED_EXTENSIONS = new Set(['.jpg', '.jpeg', '.png', '.webp'])

export async function scanImages(inputDir: string, recursive: boolean): Promise<string[]> {
  const results: string[] = []

  async function walk(currentDir: string): Promise<void> {
    const entries = await readdir(currentDir, { withFileTypes: true })

    for (const entry of entries) {
      const fullPath = join(currentDir, entry.name)

      if (entry.isDirectory()) {
        if (recursive) {
          await walk(fullPath)
        }
        continue
      }

      if (!entry.isFile()) {
        continue
      }

      const extension = extname(entry.name).toLowerCase()
      if (SUPPORTED_EXTENSIONS.has(extension)) {
        results.push(fullPath)
      }
    }
  }

  await walk(inputDir)
  return results.sort()
}

export async function fileIsNewer(targetPath: string, sourcePath: string): Promise<boolean> {
  try {
    const [targetStat, sourceStat] = await Promise.all([stat(targetPath), stat(sourcePath)])
    return targetStat.mtimeMs >= sourceStat.mtimeMs
  } catch {
    return false
  }
}
