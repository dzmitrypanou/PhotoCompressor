export function getDefaultOutputDir(inputDir: string): string {
  const normalized = inputDir.replace(/[\\/]+$/, '')
  const separator = inputDir.includes('\\') ? '\\' : '/'
  return `${normalized}${separator}compressed`
}
