import { dialog, ipcMain } from 'electron'
import type { CompressionOptions } from '../../src/types'
import { CompressionPool } from '../compressor/pool'

export function registerIpcHandlers(getPool: () => CompressionPool): void {
  ipcMain.handle('select-folder', async () => {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory']
    })

    if (result.canceled || result.filePaths.length === 0) {
      return null
    }

    return result.filePaths[0]
  })

  ipcMain.handle('start-compression', async (_event, options: CompressionOptions) => {
    const pool = getPool()
    if (pool.isRunning()) {
      throw new Error('Сжатие уже выполняется')
    }
    await pool.start(options)
  })

  ipcMain.handle('cancel-compression', async () => {
    getPool().cancel()
  })
}
