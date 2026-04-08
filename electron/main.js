require('dotenv').config()
const { app, BrowserWindow, Tray, Menu, ipcMain, nativeImage, shell } = require('electron')
const path = require('path')
const store = require('./store')
const { startStreaming, stopStreaming } = require('./deepgramService')
const { startRecording, stopRecording } = require('./audioCapture')
const { processWithGroq } = require('./groqService')
const { injectText } = require('./textInjector')

let tray = null
let settingsWindow = null
let isRecording = false
let recordingInterval = null

// ─── App Ready ───────────────────────────────────────────────
app.whenReady().then(() => {
  createTray()
  setupHotkey()
  setupIPC()
  console.log('VocalFlow started')
})

app.on('window-all-closed', (e) => {
  e.preventDefault()
})

// ─── Tray Icon ────────────────────────────────────────────────
function createTray() {
  const iconPath = path.join(__dirname, '../resources/icon.png')
  let icon

  try {
    icon = nativeImage.createFromPath(iconPath)
    if (icon.isEmpty()) throw new Error('empty')
  } catch {
    icon = nativeImage.createEmpty()
  }

  tray = new Tray(icon)
  tray.setToolTip('VocalFlow — Hold Right Alt to dictate')
  updateTrayMenu()

  tray.on('click', () => {
    openSettingsWindow()
  })
}

function updateTrayMenu() {
  const menu = Menu.buildFromTemplate([
    {
      label: isRecording ? '🔴 Recording...' : '⚪ Idle',
      enabled: false
    },
    { type: 'separator' },
    {
      label: '⚙️ Settings',
      click: () => openSettingsWindow()
    },
    { type: 'separator' },
    {
      label: '❌ Quit',
      click: () => {
        if (recordingInterval) clearInterval(recordingInterval)
        app.exit(0)
      }
    }
  ])
  tray.setContextMenu(menu)
}

function startRecordingIndicator() {
  let toggle = true
  tray.setToolTip('VocalFlow — 🔴 Recording...')
  recordingInterval = setInterval(() => {
    tray.setToolTip(toggle ? '🔴 VocalFlow — Recording...' : '⚫ VocalFlow — Recording...')
    toggle = !toggle
  }, 500)
}

function stopRecordingIndicator() {
  if (recordingInterval) {
    clearInterval(recordingInterval)
    recordingInterval = null
  }
  tray.setToolTip('VocalFlow — Hold Right Alt to dictate')
}

// ─── Settings Window ──────────────────────────────────────────
function openSettingsWindow() {
  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.focus()
    return
  }

  settingsWindow = new BrowserWindow({
    width: 520,
    height: 680,
    resizable: false,
    frame: true,
    title: 'VocalFlow Settings',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    }
  })

  if (process.env.NODE_ENV === 'development') {
    settingsWindow.loadURL('http://localhost:5173')
  } else {
    settingsWindow.loadFile(path.join(__dirname, '../dist/index.html'))
  }

  settingsWindow.on('closed', () => {
    settingsWindow = null
  })
}

// ─── Global Hotkey ────────────────────────────────────────────
function setupHotkey() {
  try {
    const { uIOhook } = require('uiohook-napi')

    let hotkeyPressed = false

    uIOhook.on('keydown', (e) => {
      const hotkey = store.get('hotkey')
      const keyMap = {
        'AltRight': 3640,
        'Alt': 56,
      }

      const targetKey = keyMap[hotkey] || 3640

      if (e.keycode === targetKey && !hotkeyPressed) {
        hotkeyPressed = true
        console.log('Hotkey DOWN - starting dictation')
        startDictation()
      }
    })

    uIOhook.on('keyup', (e) => {
      const hotkey = store.get('hotkey')
      const keyMap = {
        'AltRight': 3640,
        'Alt': 56,
      }

      const targetKey = keyMap[hotkey] || 3640

      if (e.keycode === targetKey && hotkeyPressed) {
        hotkeyPressed = false
        console.log('Hotkey UP - stopping dictation')
        stopDictation()
      }
    })

    uIOhook.start()
    console.log('Hotkey listener started')
  } catch (err) {
    console.error('Hotkey setup error:', err.message)
  }
}

// ─── Dictation Flow ───────────────────────────────────────────
function startDictation() {
  if (isRecording) return
  isRecording = true
  updateTrayMenu()
  startRecordingIndicator()
  console.log('Dictation started')

  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.webContents.send('recording-status', 'recording')
  }

  let collectedTranscript = []

  startStreaming(async (transcript) => {
    console.log('Raw transcript piece:', transcript)
    collectedTranscript.push(transcript)
  })

  startRecording()
  global.transcriptCollector = collectedTranscript
}

function stopDictation() {
  if (!isRecording) return
  isRecording = false
  updateTrayMenu()
  stopRecordingIndicator()
  console.log('Dictation stopped')

  if (settingsWindow && !settingsWindow.isDestroyed()) {
    settingsWindow.webContents.send('recording-status', 'processing')
  }

  stopRecording()

  setTimeout(async () => {
    stopStreaming()

    const collected = global.transcriptCollector || []
    console.log('All transcript pieces:', collected)

    if (collected.length > 0) {
      const fullTranscript = collected.join(' ').trim()
      console.log('Full transcript:', fullTranscript)

      const processed = await processWithGroq(fullTranscript)
      console.log('Processed transcript:', processed)

      await injectText(processed)

      if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.webContents.send('transcript', processed)
        settingsWindow.webContents.send('recording-status', 'idle')
      }
    } else {
      if (settingsWindow && !settingsWindow.isDestroyed()) {
        settingsWindow.webContents.send('recording-status', 'idle')
      }
    }

    global.transcriptCollector = []
  }, 3000)
}

// ─── IPC Handlers ─────────────────────────────────────────────
function setupIPC() {
  ipcMain.handle('get-settings', () => {
    return {
      deepgramKey: store.get('deepgramKey'),
      groqKey: store.get('groqKey'),
      hotkey: store.get('hotkey'),
      model: store.get('model'),
      language: store.get('language'),
      groqModel: store.get('groqModel'),
      enableGrammar: store.get('enableGrammar'),
      enableSpelling: store.get('enableSpelling'),
      enableTransliteration: store.get('enableTransliteration'),
      enableTranslation: store.get('enableTranslation'),
      translationTarget: store.get('translationTarget'),
    }
  })

  ipcMain.handle('save-settings', (event, settings) => {
    Object.entries(settings).forEach(([key, value]) => {
      store.set(key, value)
    })
    return { success: true }
  })

  ipcMain.handle('fetch-deepgram-models', async () => {
    try {
      const axios = require('axios')
      const apiKey = store.get('deepgramKey')
      if (!apiKey) return { error: 'No API key' }

      const response = await axios.get('https://api.deepgram.com/v1/models', {
        headers: { Authorization: `Token ${apiKey}` }
      })
      return { models: response.data }
    } catch (err) {
      return { error: err.message }
    }
  })

  ipcMain.handle('fetch-groq-models', async () => {
    try {
      const axios = require('axios')
      const apiKey = store.get('groqKey')
      if (!apiKey) return { error: 'No API key' }

      const response = await axios.get('https://api.groq.com/openai/v1/models', {
        headers: { Authorization: `Bearer ${apiKey}` }
      })
      return { models: response.data.data }
    } catch (err) {
      return { error: err.message }
    }
  })
}