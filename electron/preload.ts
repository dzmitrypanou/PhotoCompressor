import { contextBridge, ipcRenderer } from 'electron'
import type {
  CompressionOptions,
  DoneEvent,
  LogEvent,
  PhotoCompressorApi,
  ProgressEvent
} from '../src/types'

const api: PhotoCompressorApi = {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  startCompression: (options: CompressionOptions) => ipcRenderer.invoke('start-compression', options),
  cancelCompression: () => ipcRenderer.invoke('cancel-compression'),
  onProgress: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: ProgressEvent): void => {
      callback(payload)
    }
    ipcRenderer.on('compression:progress', listener)
    return () => ipcRenderer.removeListener('compression:progress', listener)
  },
  onLog: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: LogEvent): void => {
      callback(payload)
    }
    ipcRenderer.on('compression:log', listener)
    return () => ipcRenderer.removeListener('compression:log', listener)
  },
  onDone: (callback) => {
    const listener = (_event: Electron.IpcRendererEvent, payload: DoneEvent): void => {
      callback(payload)
    }
    ipcRenderer.on('compression:done', listener)
    return () => ipcRenderer.removeListener('compression:done', listener)
  }
}

contextBridge.exposeInMainWorld('api', api)
