# Oli — Source of Illumination | ஒளி — பிரகாசத்தின் மூலம்

Oli is a bilingual (English + Tamil) voice-first companion for blind and visually impaired people in Chennai and Tamil Nadu. One big gold microphone and four large actions — nothing else to find.

| # | Action | Tamil | Say | Key |
|---|--------|-------|-----|-----|
| 1 | Where am I? | நான் எங்கே? | "Where am I", "Location", "Address", "எங்கே", "இடம்" | `1` |
| 2 | What's ahead? | முன்னால் என்ன? | "What's ahead", "Obstacles", "Front", "Look", "முன்னால்", "தடை" | `2` |
| 3 | Read text | எழுத்தைப் படி | "Read text", "Read", "Sign", "படி" | `3` |
| 4 | Emergency SOS | அவசர உதவி | "Emergency", "SOS", "Help me", "உதவி" | `4` |

Other controls: `M` / `Space` = speak, `Escape` = stop voice. Say "Switch to Tamil" / "தமிழ்" or "Switch to English" / "ஆங்கிலம்" to change language instantly.

## Run with one command

```bash
docker-compose up --build
```

Open http://localhost:3000 and press **Start Oli**. No `.env` file is required.

To enable live Gemini vision:

```bash
GEMINI_API_KEY=your-key docker-compose up --build
```

### Without Docker

```bash
npm install --ignore-scripts
npm run dev
```

## Zero-Key Offline Demo

When `GEMINI_API_KEY` is not set, the header shows **"Key not set — Zero-Key Offline Demo"** and:

- **Where am I?** — live GPS via `navigator.geolocation` + free OpenStreetMap Nominatim reverse geocoding (`accept-language=en|ta`).
- **Emergency SOS** — 3-beep Web Audio siren, live GPS + street address, spoken reassurance, and a green WhatsApp button pre-filled with a Google Maps pin.
- **Voice** — neural `en-IN-NeerjaNeural` / `ta-IN-PallaviNeural` via `msedge-tts` (`rate -8%`, `pitch +4Hz`), falling back to the browser's `speechSynthesis` (rate 0.90, pitch 1.12).
- **What's ahead? / Read text** — the camera opens and captures a frame; `POST /api/vision` returns warm bilingual sample guidance so the full voice-to-camera flow can be tested.

With a key, frames go to Google `gemini-2.5-flash` and replies are forced to plain spoken sentences under 35 words in the active language.

## API

| Route | Method | Purpose |
|-------|--------|---------|
| `/api/health` | GET | `{ ok: true, service: "oli-illumination", offline: boolean }` |
| `/api/tts` | POST `{ text, lang }` | MP3 neural speech (503 → client uses browser voice) |
| `/api/vision` | POST `{ image, mode, lang }` | `{ text, offline }` — Gemini or offline sample |

## Project layout

```
app/page.tsx              Server entry, detects offline mode
app/layout.tsx            Fonts (Inter + Noto Sans Tamil), metadata
app/api/health|tts|vision Route handlers
components/oli/*          Header, start screen, Oli Says card, mic, 2x2 grid, camera, SOS
lib/oli/voiceEngine.ts    Neural TTS + speechSynthesis fallback + SpeechRecognition
lib/oli/vision.ts         Camera open/fallback, frame capture, vision client, output cleaning
lib/oli/commands.ts       English + Tamil voice command parser
lib/oli/location.ts       GPS + Nominatim reverse geocoding
lib/oli/siren.ts          Web Audio siren + haptics
lib/oli/samples.ts        Offline bilingual vision guidance
lib/oli/i18n.ts           All English + Tamil copy
```

## Accessibility

High-contrast obsidian (`#0c0a09`) + gold (`#fbbf24`) + off-white (`#fafaf9`), 56px+ touch targets, visible 4px focus rings, `aria-live` status for everything Oli says, keyboard shortcuts with `aria-keyshortcuts`, `lang` attributes for correct screen-reader pronunciation, reduced-motion support, and gentle `navigator.vibrate` haptics.

Camera, microphone and location need a secure context — `http://localhost` or HTTPS.
