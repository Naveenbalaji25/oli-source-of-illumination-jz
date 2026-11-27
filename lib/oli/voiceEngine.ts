import { SPEECH_LOCALE, type Lang } from "./i18n"

const VOICE_PREFERENCES: Record<Lang, string[]> = {
  en: ["Neerja", "Heera", "Google UK English Female", "Female India", "en-IN"],
  ta: ["Pallavi", "Google தமிழ்", "Tamil", "ta-IN"],
}

const FALLBACK_RATE = 0.9
const FALLBACK_PITCH = 1.12

let audioEl: HTMLAudioElement | null = null
let currentObjectUrl: string | null = null
let finishCurrent: (() => void) | null = null
let speakToken = 0
let neuralFailures = 0
const MAX_NEURAL_FAILURES = 3

function getAudioElement(): HTMLAudioElement {
  audioEl ??= new Audio()
  audioEl.preload = "auto"
  return audioEl
}

/** Call inside a user gesture so mobile browsers allow later audio playback. */
export function primeVoice(): void {
  if (typeof window === "undefined") return
  const el = getAudioElement()
  el.muted = true
  void el.play().catch(() => undefined).finally(() => {
    el.pause()
    el.muted = false
  })
  if ("speechSynthesis" in window) window.speechSynthesis.getVoices()
}

export function stopSpeaking(): void {
  speakToken++
  if (audioEl) {
    audioEl.pause()
    audioEl.removeAttribute("src")
  }
  if (currentObjectUrl) {
    URL.revokeObjectURL(currentObjectUrl)
    currentObjectUrl = null
  }
  if (typeof window !== "undefined" && "speechSynthesis" in window) window.speechSynthesis.cancel()
  finishCurrent?.()
  finishCurrent = null
}

async function playNeural(text: string, lang: Lang, token: number): Promise<void> {
  const res = await fetch("/api/tts", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text, lang }),
    signal: AbortSignal.timeout(9000),
  })
  if (!res.ok) throw new Error(`TTS ${res.status}`)
  const blob = await res.blob()
  if (blob.size < 512) throw new Error("Empty TTS audio")
  if (token !== speakToken) return

  const url = URL.createObjectURL(blob)
  currentObjectUrl = url
  const el = getAudioElement()
  el.src = url

  await new Promise<void>((resolve, reject) => {
    finishCurrent = resolve
    el.onended = () => resolve()
    el.onerror = () => reject(new Error("Audio playback error"))
    el.play().catch(reject)
  })
}

function pickBrowserVoice(lang: Lang): SpeechSynthesisVoice | undefined {
  const voices = window.speechSynthesis.getVoices()
  for (const pref of VOICE_PREFERENCES[lang]) {
    const match = voices.find((v) => v.name.includes(pref) || v.lang === pref)
    if (match) return match
  }
  const prefix = lang === "ta" ? "ta" : "en-IN"
  return voices.find((v) => v.lang.startsWith(prefix)) ?? voices.find((v) => v.lang.startsWith(lang))
}

function speakBrowser(text: string, lang: Lang, token: number): Promise<void> {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return Promise.resolve()
  if (token !== speakToken) return Promise.resolve()

  return new Promise<void>((resolve) => {
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.lang = SPEECH_LOCALE[lang]
    utterance.rate = FALLBACK_RATE
    utterance.pitch = FALLBACK_PITCH
    const voice = pickBrowserVoice(lang)
    if (voice) utterance.voice = voice
    finishCurrent = resolve
    utterance.onend = () => resolve()
    utterance.onerror = () => resolve()
    window.speechSynthesis.cancel()
    window.speechSynthesis.speak(utterance)
  })
}

/**
 * Speaks text with the warm neural voice from /api/tts, falling back to the
 * browser's own speech engine. Any speech already playing is cancelled first.
 */
export async function speak(text: string, lang: Lang): Promise<void> {
  if (!text.trim()) return
  stopSpeaking()
  const token = speakToken

  if (neuralFailures < MAX_NEURAL_FAILURES) {
    try {
      await playNeural(text, lang, token)
      neuralFailures = 0
      return
    } catch {
      if (token !== speakToken) return
      neuralFailures++
    }
  }
  await speakBrowser(text, lang, token)
}

interface RecognitionResultEvent {
  results: ArrayLike<ArrayLike<{ transcript: string }>>
}

interface RecognitionInstance {
  lang: string
  interimResults: boolean
  maxAlternatives: number
  continuous: boolean
  onresult: ((event: RecognitionResultEvent) => void) | null
  onerror: ((event: { error: string }) => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}

type RecognitionCtor = new () => RecognitionInstance

function getRecognitionCtor(): RecognitionCtor | null {
  if (typeof window === "undefined") return null
  const w = window as unknown as { SpeechRecognition?: RecognitionCtor; webkitSpeechRecognition?: RecognitionCtor }
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null
}

export function isRecognitionSupported(): boolean {
  return getRecognitionCtor() !== null
}

let activeRecognition: RecognitionInstance | null = null

export function cancelListening(): void {
  activeRecognition?.abort()
  activeRecognition = null
}

/** Listens for one spoken phrase. Resolves with the transcript, or "" if nothing was heard. */
export function listenOnce(lang: Lang): Promise<string> {
  const Ctor = getRecognitionCtor()
  if (!Ctor) return Promise.reject(new Error("SpeechRecognition unsupported"))
  cancelListening()

  return new Promise((resolve, reject) => {
    const recognition = new Ctor()
    activeRecognition = recognition
    recognition.lang = SPEECH_LOCALE[lang]
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognition.continuous = false

    let transcript = ""
    recognition.onresult = (event) => {
      transcript = event.results[0]?.[0]?.transcript ?? ""
    }
    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        reject(new Error(event.error))
      }
    }
    recognition.onend = () => {
      if (activeRecognition === recognition) activeRecognition = null
      resolve(transcript.trim())
    }
    recognition.start()
  })
}
