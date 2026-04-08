const config = {
  DEEPGRAM_API_KEY: process.env.DEEPGRAM_API_KEY || '',
  GROQ_API_KEY: process.env.GROQ_API_KEY || '',
  DEFAULT_MODEL: 'conversationalai',
  DEFAULT_LANGUAGE: 'en',
  DEFAULT_HOTKEY: 'AltRight',
  DEFAULT_GROQ_MODEL: 'llama3-8b-8192',
}

module.exports = config