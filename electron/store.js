const Store = require('electron-store')
const config = require('./config')

const store = new Store({
  encryptionKey: 'vocallabs-secret-key',
  schema: {
    deepgramKey: { type: 'string', default: config.DEEPGRAM_API_KEY },
    groqKey: { type: 'string', default: config.GROQ_API_KEY },
    hotkey: { type: 'string', default: config.DEFAULT_HOTKEY },
    model: { type: 'string', default: config.DEFAULT_MODEL },
    language: { type: 'string', default: config.DEFAULT_LANGUAGE },
    groqModel: { type: 'string', default: config.DEFAULT_GROQ_MODEL },
    enableGrammar: { type: 'boolean', default: false },
    enableSpelling: { type: 'boolean', default: false },
    enableTransliteration: { type: 'boolean', default: false },
    enableTranslation: { type: 'boolean', default: false },
    translationTarget: { type: 'string', default: 'English' },
  }
})

module.exports = store