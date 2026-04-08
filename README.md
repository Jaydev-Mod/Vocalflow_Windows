# VocalFlow — Windows Port

A lightweight Windows system tray app that lets you dictate into any text field — anywhere on your PC — using a hold-to-record hotkey.

**Hold a key → speak → release → text appears at your cursor.**

This is a Windows port of [VocalFlow for macOS](https://github.com/Vocallabsai/vocalflow), rebuilt using Electron + React.

---

## How It Works

1. Hold the configured hotkey (e.g. Right Alt)
2. Speak
3. Release — the transcript is injected at your cursor via simulated paste

Audio is streamed in real-time to **Deepgram** for transcription. Optionally, the raw transcript is passed through **Groq** for spelling correction, grammar correction, code-mix transliteration, or translation before injection.

---

## Features

- **Hold-to-record hotkey** — configurable: Right Alt or Left Alt
- **Real-time streaming ASR** — powered by Deepgram's WebSocket API
- **Post-processing via Groq LLM**
  - Spelling correction
  - Grammar correction
  - Code-mix transliteration (Hinglish, Tanglish, Spanglish, and more)
  - Translation to any target language
- **Works in any app** — text is injected via simulated Ctrl+V
- **System tray app** — no taskbar icon, minimal footprint
- **API keys stored securely** — encrypted via electron-store
- **Deepgram & Groq balance display** — see your remaining credits in settings
- **Configurable via Settings UI** — no config file editing needed

---

## Requirements

- Windows 10 or later
- Node.js v18 or later
- npm v8 or later
- SoX audio tool (see setup below)
- Deepgram API key (free tier available)
- Groq API key (optional, for post-processing)

---

## Installation & Setup

### Step 1 — Clone the repo

```bash
git clone https://github.com/Jaydev-Mod/Vocalflow_Windows.git
cd vocallabs-windows
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Install SoX (required for microphone capture)

Download and install SoX from:
👉 https://sourceforge.net/projects/sox/files/sox/14.4.2/sox-14.4.2-win32.exe/download

After installing, add SoX to your Windows PATH:
- Open System Properties → Environment Variables
- Under System Variables → find Path → Edit
- Add: `C:\Program Files (x86)\sox-14-4-2`
- Click OK

Verify installation:
```bash
sox --version
```

### Step 4 — Configure API Keys

Create a `.env` file in the project root based on the provided `.env.example`:

```bash
cp .env.example .env
```

Then open `.env` and add your API keys:

DEEPGRAM_API_KEY=your_deepgram_api_key_here
GROQ_API_KEY=your_groq_api_key_here

Get your keys here:
- Deepgram: https://console.deepgram.com/signup (free tier available)
- Groq: https://console.groq.com (free)


### Step 5 — Run the app

Open two terminals:

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
NODE_ENV=development npm run electron
```

---

## Usage

1. The app starts in the **system tray** (bottom right, near the clock)
2. Click the tray icon to open **Settings**
3. Your API keys from `config.js` are pre-loaded
4. Click **Fetch Models** to load available Deepgram models
5. Choose your **hotkey**, **model**, and **language**
6. Optionally configure **Groq post-processing**
7. Click **Save Settings**
8. Open any app (Notepad, browser, VS Code, etc.)
9. **Hold Right Alt** → speak → **release**
10. Your speech appears as text at your cursor!

---
## Project Structure

```
vocallabs-windows/
├── electron/
│   ├── main.js              # App entry point, tray icon, hotkey
│   ├── preload.js           # Secure bridge between main and renderer
│   ├── store.js             # Settings persistence (electron-store)
│   ├── config.js            # API keys and default configuration
│   ├── audioCapture.js      # Microphone capture via SoX
│   ├── deepgramService.js   # WebSocket streaming to Deepgram
│   ├── groqService.js       # LLM post-processing via Groq
│   └── textInjector.js      # Clipboard-based text injection (Ctrl+V)
├── src/
│   ├── index.html           # HTML entry point
│   ├── index.jsx            # React entry point
│   ├── App.jsx              # Root React component
│   └── components/
│       └── SettingsView.jsx # Full settings UI
├── resources/
│   └── icon.png             # System tray icon
├── .env.example             # Environment variables template
├── package.json             # Project dependencies
├── vite.config.js           # React build configuration
└── README.md                # This file
```

---

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| Electron | Desktop app framework |
| React | Settings UI |
| Vite | React build tool |
| uiohook-napi | Global hotkey detection |
| SoX | Microphone audio capture |
| Deepgram WebSocket API | Real-time speech-to-text |
| Groq API | LLM post-processing |
| @nut-tree-fork/nut-js | Keyboard simulation (Ctrl+V) |
| electron-store | Encrypted settings storage |

---

## Windows vs macOS Differences

| Feature | macOS (Original) | Windows (This Port) |
|---------|-----------------|---------------------|
| Language | Swift | JavaScript/Node.js |
| Framework | Native AppKit | Electron + React |
| Hotkey detection | NSEvent global monitor | uiohook-napi |
| Audio capture | AVAudioEngine | SoX via child_process |
| Text injection | CGEvent Cmd+V | nut-js Ctrl+V |
| Secure storage | macOS Keychain | electron-store encrypted |
| UI | SwiftUI | React |
| Distribution | .app bundle | Electron app |

---

## Contributing

Pull requests are welcome. For significant changes, open an issue first.

1. Fork the repo
2. Create a feature branch (`git checkout -b feature/my-feature`)
3. Commit your changes
4. Open a pull request

---
