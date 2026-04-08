const WebSocket = require('ws')
const store = require('./store')

let ws = null
let onTranscriptCallback = null
let isConnected = false
let audioQueue = []

function startStreaming(onTranscript) {
  onTranscriptCallback = onTranscript
  isConnected = false
  audioQueue = []

  const apiKey = store.get('deepgramKey')
  const model = store.get('model') || 'conversationalai'

  if (!apiKey) {
    console.error('No Deepgram API key found')
    return null
  }

  const url = `wss://api.deepgram.com/v1/listen?model=${model}&punctuate=true&interim_results=true&encoding=linear16&sample_rate=16000&channels=1`

  console.log('Connecting to Deepgram:', url)

  ws = new WebSocket(url, {
    headers: {
      Authorization: `Token ${apiKey}`
    }
  })

  ws.on('open', () => {
    console.log('Deepgram WebSocket connected')
    isConnected = true

    // Flush queued audio
    console.log(`Flushing ${audioQueue.length} queued chunks`)
    audioQueue.forEach(chunk => {
      ws.send(chunk)
    })
    audioQueue = []
  })

  ws.on('message', (data) => {
    try {
      const response = JSON.parse(data.toString())
      console.log('Deepgram response type:', response.type)

      if (response.type === 'Results') {
        const transcript = response?.channel?.alternatives?.[0]?.transcript
        const isFinal = response?.is_final
        console.log('Transcript:', transcript, '| Final:', isFinal)

        if (transcript && transcript.trim() !== '' && isFinal) {
          console.log('✅ Final transcript:', transcript)
          if (onTranscriptCallback) {
            onTranscriptCallback(transcript)
          }
        }
      }
    } catch (err) {
      console.error('Deepgram parse error:', err.message)
    }
  })

  ws.on('error', (err) => {
    console.error('Deepgram WebSocket error:', err.message)
    isConnected = false
  })

  ws.on('close', (code, reason) => {
    console.log('Deepgram WebSocket closed, code:', code, 'reason:', reason?.toString())
    isConnected = false
  })

  return ws
}

function sendAudio(audioBuffer) {
  if (ws && ws.readyState === WebSocket.OPEN && isConnected) {
    ws.send(audioBuffer)
  } else {
    // Queue audio until WebSocket is ready
    audioQueue.push(audioBuffer)
  }
}

function stopStreaming() {
  if (ws) {
    try {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'CloseStream' }))
        console.log('Sent CloseStream to Deepgram')
      }
    } catch(e) {
      console.error('Error sending CloseStream:', e.message)
    }

    setTimeout(() => {
      if (ws) {
        ws.close()
        ws = null
        isConnected = false
        audioQueue = []
      }
    }, 3000)
  }
}

module.exports = { startStreaming, sendAudio, stopStreaming }