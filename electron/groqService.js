const axios = require('axios')
const store = require('./store')

async function processWithGroq(transcript) {
  const groqKey = store.get('deepgramKey') 
  const groqApiKey = store.get('groqKey')
  
  if (!groqApiKey) return transcript

  const enableGrammar = store.get('enableGrammar')
  const enableSpelling = store.get('enableSpelling')
  const enableTransliteration = store.get('enableTransliteration')
  const enableTranslation = store.get('enableTranslation')
  const translationTarget = store.get('translationTarget')

  if (!enableGrammar && !enableSpelling && !enableTransliteration && !enableTranslation) {
    return transcript
  }

  let systemPrompt = 'You are a text processing assistant. '

  if (enableSpelling) systemPrompt += 'Fix all spelling errors. '
  if (enableGrammar) systemPrompt += 'Fix all grammar errors. '
  if (enableTransliteration) systemPrompt += 'Transliterate code-mixed text to proper English script. '
  if (enableTranslation) systemPrompt += `Translate the text to ${translationTarget}. `
  
  systemPrompt += 'Return ONLY the processed text, nothing else. No explanations.'

  try {
    const response = await axios.post(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        model: store.get('groqModel'),
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: transcript }
        ],
        max_tokens: 1000,
        temperature: 0.1
      },
      {
        headers: {
          'Authorization': `Bearer ${groqApiKey}`,
          'Content-Type': 'application/json'
        }
      }
    )
    return response.data.choices[0].message.content.trim()
  } catch (error) {
    console.error('Groq error:', error.message)
    return transcript
  }
}

module.exports = { processWithGroq }