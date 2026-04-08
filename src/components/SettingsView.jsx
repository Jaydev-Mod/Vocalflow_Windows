import React, { useState, useEffect } from 'react'

const styles = {
  container: {
    padding: '20px',
    fontFamily: 'Segoe UI, sans-serif',
    color: 'white',
    maxHeight: '100vh',
    overflowY: 'auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '20px',
    borderBottom: '1px solid #333',
    paddingBottom: '15px',
  },
  title: {
    color: '#00d4ff',
    fontSize: '20px',
    fontWeight: 'bold',
    margin: 0,
  },
  section: {
    marginBottom: '20px',
    background: '#16213e',
    borderRadius: '10px',
    padding: '15px',
  },
  sectionTitle: {
    color: '#00d4ff',
    fontSize: '13px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    marginBottom: '12px',
    margin: '0 0 12px 0',
  },
  label: {
    display: 'block',
    fontSize: '13px',
    color: '#aaa',
    marginBottom: '5px',
  },
  input: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #333',
    background: '#0f0f23',
    color: 'white',
    fontSize: '13px',
    boxSizing: 'border-box',
    marginBottom: '10px',
  },
  select: {
    width: '100%',
    padding: '8px 10px',
    borderRadius: '6px',
    border: '1px solid #333',
    background: '#0f0f23',
    color: 'white',
    fontSize: '13px',
    boxSizing: 'border-box',
    marginBottom: '10px',
  },
  row: {
    display: 'flex',
    gap: '10px',
    alignItems: 'flex-end',
  },
  btnPrimary: {
    background: '#00d4ff',
    color: '#0f0f23',
    border: 'none',
    padding: '9px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  btnSecondary: {
    background: '#1a1a3e',
    color: '#00d4ff',
    border: '1px solid #00d4ff',
    padding: '9px 18px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '13px',
    whiteSpace: 'nowrap',
  },
  btnSave: {
    background: '#00d4ff',
    color: '#0f0f23',
    border: 'none',
    padding: '11px',
    borderRadius: '6px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '14px',
    width: '100%',
    marginTop: '5px',
  },
  toggleRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid #222',
  },
  toggleLabel: {
    fontSize: '13px',
    color: '#ccc',
  },
  toggle: {
    width: '36px',
    height: '20px',
    cursor: 'pointer',
  },
  statusBar: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px',
    borderRadius: '6px',
    background: '#0f0f23',
    fontSize: '13px',
    marginTop: '10px',
  },
  dot: (color) => ({
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: color,
    flexShrink: 0,
  }),
}

const LANGUAGES = [
  { value: 'en', label: 'English' },
  { value: 'hi', label: 'Hindi' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ko', label: 'Korean' },
  { value: 'zh', label: 'Chinese' },
]

const HOTKEYS = [
  { value: 'AltRight', label: 'Right Alt (Recommended)' },
  { value: 'Alt', label: 'Left Alt' },
]

function SettingsView() {
  const [deepgramKey, setDeepgramKey] = useState('')
  const [groqKey, setGroqKey] = useState('')
  const [models, setModels] = useState([])
  const [groqModels, setGroqModels] = useState([])
  const [selectedModel, setSelectedModel] = useState('nova-2')
  const [selectedLanguage, setSelectedLanguage] = useState('en')
  const [selectedHotkey, setSelectedHotkey] = useState('AltRight')
  const [selectedGroqModel, setSelectedGroqModel] = useState('llama3-8b-8192')
  const [enableGrammar, setEnableGrammar] = useState(false)
  const [enableSpelling, setEnableSpelling] = useState(false)
  const [enableTransliteration, setEnableTransliteration] = useState(false)
  const [enableTranslation, setEnableTranslation] = useState(false)
  const [translationTarget, setTranslationTarget] = useState('English')
  const [status, setStatus] = useState('idle')
  const [statusMsg, setStatusMsg] = useState('Ready to dictate')
  const [lastTranscript, setLastTranscript] = useState('')

  // Load saved settings on mount
  useEffect(() => {
    loadSettings()

    // Listen for transcript from main process
    if (window.electronAPI) {
      window.electronAPI.onTranscript((text) => {
        setLastTranscript(text)
        setStatus('idle')
        setStatusMsg('Transcript received!')
        setTimeout(() => setStatusMsg('Ready to dictate'), 3000)
      })

      window.electronAPI.onRecordingStatus((s) => {
        setStatus(s)
        if (s === 'recording') setStatusMsg('🔴 Recording...')
        else if (s === 'processing') setStatusMsg('⚙️ Processing...')
        else setStatusMsg('Ready to dictate')
      })
    }
  }, [])

  async function loadSettings() {
    if (!window.electronAPI) return
    try {
      const s = await window.electronAPI.getSettings()
      if (s.deepgramKey) setDeepgramKey(s.deepgramKey)
      if (s.groqKey) setGroqKey(s.groqKey)
      if (s.model) setSelectedModel(s.model)
      if (s.language) setSelectedLanguage(s.language)
      if (s.hotkey) setSelectedHotkey(s.hotkey)
      if (s.groqModel) setSelectedGroqModel(s.groqModel)
      setEnableGrammar(s.enableGrammar || false)
      setEnableSpelling(s.enableSpelling || false)
      setEnableTransliteration(s.enableTransliteration || false)
      setEnableTranslation(s.enableTranslation || false)
      if (s.translationTarget) setTranslationTarget(s.translationTarget)
    } catch (err) {
      console.error('Failed to load settings:', err)
    }
  }

  async function saveSettings() {
    if (!window.electronAPI) return
    try {
      await window.electronAPI.saveSettings({
        deepgramKey,
        groqKey,
        model: selectedModel,
        language: selectedLanguage,
        hotkey: selectedHotkey,
        groqModel: selectedGroqModel,
        enableGrammar,
        enableSpelling,
        enableTransliteration,
        enableTranslation,
        translationTarget,
      })
      setStatusMsg('✅ Settings saved!')
      setTimeout(() => setStatusMsg('Ready to dictate'), 2000)
    } catch (err) {
      setStatusMsg('❌ Failed to save')
    }
  }

  async function fetchDeepgramModels() {
    if (!deepgramKey) {
      setStatusMsg('❌ Enter Deepgram key first')
      return
    }
    setStatusMsg('Fetching models...')
    try {
      const result = await window.electronAPI.fetchDeepgramModels()
      if (result.error) {
        setStatusMsg('❌ ' + result.error)
        return
      }
      const modelList = result.models?.stt || []
      const names = modelList.map(m => m.name || m.model_id).filter(Boolean)
      if (names.length > 0) {
        setModels(names)
        setStatusMsg('✅ Models loaded!')
      } else {
        setModels(['nova-2', 'nova', 'enhanced', 'base'])
        setStatusMsg('✅ Default models loaded')
      }
      setTimeout(() => setStatusMsg('Ready to dictate'), 2000)
    } catch (err) {
      setModels(['nova-2', 'nova', 'enhanced', 'base'])
      setStatusMsg('✅ Default models loaded')
    }
  }

  async function fetchGroqModels() {
    if (!groqKey) {
      setStatusMsg('❌ Enter Groq key first')
      return
    }
    setStatusMsg('Fetching Groq models...')
    try {
      const result = await window.electronAPI.fetchGroqModels()
      if (result.error) {
        setStatusMsg('❌ ' + result.error)
        return
      }
      const names = result.models?.map(m => m.id).filter(Boolean) || []
      if (names.length > 0) {
        setGroqModels(names)
        setStatusMsg('✅ Groq models loaded!')
      } else {
        setGroqModels(['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'])
        setStatusMsg('✅ Default Groq models loaded')
      }
      setTimeout(() => setStatusMsg('Ready to dictate'), 2000)
    } catch (err) {
      setGroqModels(['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'])
      setStatusMsg('✅ Default Groq models loaded')
    }
  }

  const statusColor = {
    idle: '#00d4ff',
    recording: '#ff4444',
    processing: '#ffaa00',
  }[status] || '#00d4ff'

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <span style={{ fontSize: '24px' }}>🎙️</span>
        <h2 style={styles.title}>VocalFlow Settings</h2>
      </div>

      {/* Status Bar */}
      <div style={styles.statusBar}>
        <div style={styles.dot(statusColor)} />
        <span>{statusMsg}</span>
        {lastTranscript && (
          <span style={{ color: '#666', fontSize: '12px', marginLeft: 'auto' }}>
            Last: "{lastTranscript.slice(0, 30)}..."
          </span>
        )}
      </div>

      {/* Deepgram Section */}
      <div style={{ ...styles.section, marginTop: '15px' }}>
        <p style={styles.sectionTitle}>🔑 Deepgram ASR</p>

        <label style={styles.label}>API Key</label>
        <input
          type="password"
          value={deepgramKey}
          onChange={e => setDeepgramKey(e.target.value)}
          placeholder="Enter Deepgram API key"
          style={styles.input}
        />

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Model</label>
            <select
              value={selectedModel}
              onChange={e => setSelectedModel(e.target.value)}
              style={styles.select}
            >
              {models.length === 0
                ? ['nova-2', 'nova', 'enhanced', 'base'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))
                : models.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))
              }
            </select>
          </div>
          <button
            style={{ ...styles.btnSecondary, marginBottom: '10px' }}
            onClick={fetchDeepgramModels}
          >
            Fetch Models
          </button>
        </div>

        <label style={styles.label}>Language</label>
        <select
          value={selectedLanguage}
          onChange={e => setSelectedLanguage(e.target.value)}
          style={styles.select}
        >
          {LANGUAGES.map(l => (
            <option key={l.value} value={l.value}>{l.label}</option>
          ))}
        </select>
      </div>

      {/* Hotkey Section */}
      <div style={styles.section}>
        <p style={styles.sectionTitle}>⌨️ Hotkey</p>
        <label style={styles.label}>Hold to Record</label>
        <select
          value={selectedHotkey}
          onChange={e => setSelectedHotkey(e.target.value)}
          style={styles.select}
        >
          {HOTKEYS.map(h => (
            <option key={h.value} value={h.value}>{h.label}</option>
          ))}
        </select>
        <p style={{ fontSize: '12px', color: '#666', margin: '0' }}>
          💡 Hold the selected key anywhere on Windows to start dictating
        </p>
      </div>

      {/* Groq Section */}
      <div style={styles.section}>
        <p style={styles.sectionTitle}>🤖 Groq Post-Processing (Optional)</p>

        <label style={styles.label}>API Key</label>
        <input
          type="password"
          value={groqKey}
          onChange={e => setGroqKey(e.target.value)}
          placeholder="Enter Groq API key (optional)"
          style={styles.input}
        />

        <div style={styles.row}>
          <div style={{ flex: 1 }}>
            <label style={styles.label}>Model</label>
            <select
              value={selectedGroqModel}
              onChange={e => setSelectedGroqModel(e.target.value)}
              style={styles.select}
            >
              {groqModels.length === 0
                ? ['llama3-8b-8192', 'llama3-70b-8192', 'mixtral-8x7b-32768'].map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))
                : groqModels.map(m => (
                    <option key={m} value={m}>{m}</option>
                  ))
              }
            </select>
          </div>
          <button
            style={{ ...styles.btnSecondary, marginBottom: '10px' }}
            onClick={fetchGroqModels}
          >
            Fetch Models
          </button>
        </div>

        {/* Toggles */}
        <div style={styles.toggleRow}>
          <span style={styles.toggleLabel}>✏️ Spelling Correction</span>
          <input
            type="checkbox"
            checked={enableSpelling}
            onChange={e => setEnableSpelling(e.target.checked)}
            style={styles.toggle}
          />
        </div>
        <div style={styles.toggleRow}>
          <span style={styles.toggleLabel}>📝 Grammar Correction</span>
          <input
            type="checkbox"
            checked={enableGrammar}
            onChange={e => setEnableGrammar(e.target.checked)}
            style={styles.toggle}
          />
        </div>
        <div style={styles.toggleRow}>
          <span style={styles.toggleLabel}>🔄 Code-mix Transliteration (Hinglish etc.)</span>
          <input
            type="checkbox"
            checked={enableTransliteration}
            onChange={e => setEnableTransliteration(e.target.checked)}
            style={styles.toggle}
          />
        </div>
        <div style={{ ...styles.toggleRow, borderBottom: 'none' }}>
          <span style={styles.toggleLabel}>🌍 Translation</span>
          <input
            type="checkbox"
            checked={enableTranslation}
            onChange={e => setEnableTranslation(e.target.checked)}
            style={styles.toggle}
          />
        </div>

        {enableTranslation && (
          <div style={{ marginTop: '10px' }}>
            <label style={styles.label}>Translate to</label>
            <input
              type="text"
              value={translationTarget}
              onChange={e => setTranslationTarget(e.target.value)}
              placeholder="e.g. Hindi, French, Spanish"
              style={styles.input}
            />
          </div>
        )}
      </div>

      {/* Save Button */}
      <button style={styles.btnSave} onClick={saveSettings}>
        💾 Save Settings
      </button>

      <p style={{ fontSize: '11px', color: '#444', textAlign: 'center', marginTop: '10px' }}>
        VocalFlow v1.0.0 — Windows Port
      </p>
    </div>
  )
}

export default SettingsView