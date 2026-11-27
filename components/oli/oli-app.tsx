"use client"

import { useEffect, useEffectEvent, useRef, useState } from "react"
import { AppHeader } from "./app-header"
import { CameraPanel } from "./camera-panel"
import { MicButton } from "./mic-button"
import { OliSaysCard } from "./oli-says-card"
import { OperationGrid } from "./operation-grid"
import { SosPanel, type SosState } from "./sos-panel"
import { StartScreen } from "./start-screen"
import { parseCommand } from "@/lib/oli/commands"
import { STRINGS, type Lang, type Operation } from "@/lib/oli/i18n"
import { getLiveLocation, getPosition, shortPlace } from "@/lib/oli/location"
import { haptic, playSiren, unlockAudio } from "@/lib/oli/siren"
import { analyzeFrame, type VisionMode } from "@/lib/oli/vision"
import { readTextOffline } from "@/lib/oli/ocr"
import { detectObjectsOffline, preloadDetector } from "@/lib/oli/detect"
import { OFFLINE_OCR_UNCLEAR_MESSAGE, OFFLINE_PATH_CLEAR_MESSAGE } from "@/lib/oli/vision-messages"
import {
  cancelListening,
  isRecognitionSupported,
  listenOnce,
  primeVoice,
  speak,
  stopSpeaking,
} from "@/lib/oli/voiceEngine"

const OP_BY_KEY: Record<string, Operation> = { "1": "location", "2": "obstacles", "3": "read", "4": "sos" }

async function warmUpPermissions(): Promise<void> {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: { facingMode: { ideal: "environment" } },
    })
    stream.getTracks().forEach((track) => track.stop())
  } catch {
    try {
      const mic = await navigator.mediaDevices.getUserMedia({ audio: true })
      mic.getTracks().forEach((track) => track.stop())
    } catch {
      /* the user can still use the buttons without a microphone */
    }
  }
  getPosition().catch(() => undefined)
}

export function OliApp({ offline }: { offline: boolean }) {
  const [started, setStarted] = useState(false)
  const [lang, setLang] = useState<Lang>("en")
  const [message, setMessage] = useState<string>(STRINGS.en.greeting)
  const [heard, setHeard] = useState("")
  const [listening, setListening] = useState(false)
  const [busy, setBusy] = useState<Operation | null>(null)
  const [camera, setCamera] = useState<VisionMode | null>(null)
  const [scanning, setScanning] = useState(false)
  const [sos, setSos] = useState<SosState | null>(null)

  const langRef = useRef<Lang>("en")
  const lastSpoken = useRef<{ text: string; lang: Lang }>({ text: STRINGS.en.greeting, lang: "en" })
  const t = STRINGS[lang]

  const say = (text: string, l: Lang = langRef.current) => {
    setMessage(text)
    lastSpoken.current = { text, lang: l }
    return speak(text, l)
  }

  const changeLang = (next: Lang) => {
    langRef.current = next
    setLang(next)
    document.documentElement.lang = next
    haptic()
    void say(STRINGS[next].switched, next)
  }

  const runLocation = async () => {
    const l = langRef.current
    void say(STRINGS[l].findingLocation, l)
    try {
      const live = await getLiveLocation(l)
      await say(STRINGS[l].describeLocation(live.address), l)
    } catch {
      await say(STRINGS[l].locationDenied, l)
    }
  }

  const runSos = async () => {
    const l = langRef.current
    setCamera(null)
    setSos({})
    haptic([200, 100, 200, 100, 200])
    await playSiren(3)
    void say(STRINGS[l].sosStart, l)
    try {
      const live = await getLiveLocation(l)
      const place = shortPlace(live.address)
      setSos({ mapsUrl: live.mapsUrl, place })
      await say(STRINGS[l].sosReady(place), l)
    } catch {
      await say(STRINGS[l].sosNoLocation, l)
    }
  }

  const runOperation = async (op: Operation) => {
    haptic()
    cancelListening()
    setListening(false)
    if (op !== "sos") setSos(null)

    if (op === "obstacles" || op === "read") {
      setCamera(op)
      void say(op === "read" ? STRINGS[langRef.current].openingCameraRead : STRINGS[langRef.current].openingCamera)
      return
    }

    setBusy(op)
    try {
      await (op === "location" ? runLocation() : runSos())
    } finally {
      setBusy(null)
    }
  }

  const handleFrame = async (image: string | null) => {
    if (!camera) return
    const l = langRef.current
    setScanning(true)
    let reply: string
    try {
      const result = await analyzeFrame({ image, mode: camera, lang: l })
      if (result.source === "offline" && camera === "read") {
        reply = image ? await readTextOffline(image, l) : OFFLINE_OCR_UNCLEAR_MESSAGE[l]
      } else if (result.source === "offline" && camera === "obstacles") {
        reply = image ? await detectObjectsOffline(image, l) : OFFLINE_PATH_CLEAR_MESSAGE[l]
      } else {
        reply = result.text
      }
      haptic(30)
    } catch {
      reply = STRINGS[l].visionError
    }
    setScanning(false)
    await say(reply, l)
  }

  const handleTranscript = (transcript: string) => {
    const command = parseCommand(transcript)
    if (command.type === "lang") changeLang(command.lang)
    else if (command.type === "op") void runOperation(command.op)
    else void say(STRINGS[langRef.current].didNotCatch)
  }

  const toggleListening = async () => {
    if (listening) {
      cancelListening()
      setListening(false)
      return
    }
    if (!isRecognitionSupported()) {
      void say(STRINGS[langRef.current].noSpeech)
      return
    }
    stopSpeaking()
    haptic()
    setListening(true)
    setHeard("")
    try {
      const transcript = await listenOnce(langRef.current)
      setListening(false)
      if (!transcript) {
        void say(STRINGS[langRef.current].didNotCatch)
        return
      }
      setHeard(transcript)
      handleTranscript(transcript)
    } catch {
      setListening(false)
      void say(STRINGS[langRef.current].noSpeech)
    }
  }

  const handleStart = () => {
    primeVoice()
    unlockAudio()
    haptic()
    setStarted(true)
    void say(STRINGS[langRef.current].greeting)
    void warmUpPermissions()
    if (offline) preloadDetector()
  }

  const stopAll = () => {
    stopSpeaking()
    cancelListening()
    setListening(false)
  }

  const onKeyDown = useEffectEvent((event: KeyboardEvent) => {
    if (!started || event.metaKey || event.ctrlKey || event.altKey) return
    const target = event.target as HTMLElement | null
    const onControl = target?.closest("button, a, input, textarea, select")
    const key = event.key

    if (key === "Escape") {
      stopAll()
      return
    }
    if (key === " " && onControl) return
    if (key === "m" || key === "M" || key === " ") {
      event.preventDefault()
      void toggleListening()
      return
    }
    const op = OP_BY_KEY[key]
    if (op) {
      event.preventDefault()
      void runOperation(op)
    }
  })

  useEffect(() => {
    const listener = (event: KeyboardEvent) => onKeyDown(event)
    window.addEventListener("keydown", listener)
    return () => {
      window.removeEventListener("keydown", listener)
      stopSpeaking()
      cancelListening()
    }
  }, [])

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col gap-5 px-4 py-5 sm:py-8">
      <AppHeader lang={lang} t={t} offline={offline} onLangChange={changeLang} />

      {!started ? (
        <StartScreen t={t} onStart={handleStart} />
      ) : (
        <>
          <OliSaysCard
            lang={lang}
            t={t}
            message={message}
            heard={heard}
            onRepeat={() => void speak(lastSpoken.current.text, lastSpoken.current.lang)}
            onStop={stopAll}
          />

          {camera ? (
            <CameraPanel
              key={camera}
              t={t}
              mode={camera}
              scanning={scanning}
              onFrame={(image) => void handleFrame(image)}
              onClose={() => {
                setCamera(null)
                stopSpeaking()
              }}
            />
          ) : null}

          {sos ? <SosPanel t={t} sos={sos} /> : null}

          <MicButton t={t} listening={listening} onPress={() => void toggleListening()} />

          <OperationGrid t={t} busy={busy} onSelect={(op) => void runOperation(op)} />

          <p className="text-center text-sm text-muted-foreground">{t.shortcuts}</p>
        </>
      )}
    </main>
  )
}
