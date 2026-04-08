const { spawn } = require('child_process')
const { sendAudio } = require('./deepgramService')

let soxProcess = null

function startRecording() {
  console.log('Starting audio capture...')

  try {
    // Spawn SoX directly with waveaudio driver
    soxProcess = spawn('sox', [
      '-t', 'waveaudio', 'Microphone',
      '-r', '16000',
      '-c', '1',
      '-e', 'signed-integer',
      '-b', '16',
      '-t', 'raw',
      '-'
    ])

    soxProcess.stdout.on('data', (chunk) => {
      console.log('Audio chunk received, size:', chunk.length)
      sendAudio(chunk)
    })

    soxProcess.stderr.on('data', (data) => {
      console.log('SoX info:', data.toString())
    })

    soxProcess.on('error', (err) => {
      console.error('SoX process error:', err.message)
    })

    soxProcess.on('close', (code) => {
      console.log('SoX process closed with code:', code)
    })

    console.log('Audio capture started successfully')
  } catch (err) {
    console.error('Failed to start recording:', err)
  }
}

function stopRecording() {
  try {
    if (soxProcess) {
      soxProcess.kill()
      soxProcess = null
      console.log('Audio capture stopped')
    }
  } catch (err) {
    console.error('Failed to stop recording:', err)
  }
}

module.exports = { startRecording, stopRecording }