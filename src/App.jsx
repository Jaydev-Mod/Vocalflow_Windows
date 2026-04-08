import React from 'react'
import SettingsView from './components/SettingsView'

function App() {
  return (
    <div style={{
      width: '100%',
      height: '100vh',
      background: '#1a1a2e',
      color: 'white',
      fontFamily: 'Segoe UI, sans-serif',
      overflow: 'auto'
    }}>
      <SettingsView />
    </div>
  )
}

export default App