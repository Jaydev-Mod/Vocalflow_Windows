const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),

  // Models
  fetchDeepgramModels: () => ipcRenderer.invoke('fetch-deepgram-models'),
  fetchGroqModels: () => ipcRenderer.invoke('fetch-groq-models'),

  // Events from main process
  onTranscript: (callback) => ipcRenderer.on('transcript', (event, text) => callback(text)),
  onRecordingStatus: (callback) => ipcRenderer.on('recording-status', (event, status) => callback(status)),
})