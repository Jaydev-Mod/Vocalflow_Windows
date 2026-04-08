const { clipboard } = require('electron')
const { keyboard, Key } = require('@nut-tree-fork/nut-js')

// Configure nut-js for faster performance
keyboard.config.autoDelayMs = 0

async function injectText(text) {
  try {
    console.log('Injecting text:', text)

    // Save original clipboard
    const original = clipboard.readText()

    // Write transcript to clipboard
    clipboard.writeText(text)

    // Wait for the previously focused window to regain focus
    await new Promise(resolve => setTimeout(resolve, 300))

    // Simulate Ctrl+V to paste
    await keyboard.pressKey(Key.LeftControl, Key.V)
    await keyboard.releaseKey(Key.LeftControl, Key.V)

    // Restore original clipboard after paste
    await new Promise(resolve => setTimeout(resolve, 300))
    clipboard.writeText(original)

    console.log('Text injected successfully:', text)
    return true
  } catch (error) {
    console.error('Text injection error:', error.message)
    return false
  }
}

module.exports = { injectText }