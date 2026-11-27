import type { ObjectDetection } from "@tensorflow-models/coco-ssd"
import type { Lang } from "./i18n"
import { OFFLINE_PATH_CLEAR_MESSAGE } from "./vision-messages"

const MIN_SCORE = 0.45
const MAX_OBJECTS = 3

type Direction = "left" | "right" | "straight"

const DIRECTION_TEXT: Record<Lang, Record<Direction, string>> = {
  en: { left: "on your left", right: "on your right", straight: "straight ahead" },
  ta: { left: "இடதுபுறம்", right: "வலதுபுறம்", straight: "நேராக" },
}

const TAMIL_LABELS: Record<string, string> = {
  person: "நபர்",
  chair: "நாற்காலி",
  bottle: "பாட்டில்",
  laptop: "மடிக்கணினி",
  "cell phone": "கைபேசி",
  cup: "கோப்பை",
  backpack: "பை",
  handbag: "பை",
  suitcase: "பெட்டி",
  "dining table": "மேசை",
  bed: "படுக்கை",
  couch: "சோபா",
  car: "கார்",
  bicycle: "மிதிவண்டி",
  motorcycle: "இருசக்கர வாகனம்",
  bus: "பேருந்து",
  truck: "லாரி",
  dog: "நாய்",
  cat: "பூனை",
  cow: "மாடு",
  bench: "பெஞ்ச்",
  "potted plant": "செடி",
  tv: "தொலைக்காட்சி",
  book: "புத்தகம்",
  umbrella: "குடை",
  "traffic light": "போக்குவரத்து விளக்கு",
  "stop sign": "நிறுத்த அடையாளம்",
  "fire hydrant": "தீயணைப்புக் குழாய்",
  door: "கதவு",
}

let modelPromise: Promise<ObjectDetection> | null = null

async function loadModel(): Promise<ObjectDetection> {
  modelPromise ??= (async () => {
    const tf = await import("@tensorflow/tfjs")
    await tf.ready()
    const cocoSsd = await import("@tensorflow-models/coco-ssd")
    return cocoSsd.load({ base: "lite_mobilenet_v2" })
  })().catch((error) => {
    modelPromise = null
    throw error
  })
  return modelPromise
}

/** Starts downloading the detection model early so the first scan is faster. */
export function preloadDetector(): void {
  void loadModel().catch(() => undefined)
}

function loadImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Could not decode frame"))
    img.src = `data:image/jpeg;base64,${base64}`
  })
}

function directionOf(x: number, width: number, frameWidth: number): Direction {
  const center = (x + width / 2) / frameWidth
  if (center < 0.38) return "left"
  if (center > 0.62) return "right"
  return "straight"
}

function joinList(items: string[], lang: Lang): string {
  if (lang === "ta") return items.join(" மற்றும் ")
  if (items.length <= 1) return items[0] ?? ""
  return `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`
}

function withArticle(label: string): string {
  return /^[aeiou]/i.test(label) ? `an ${label}` : `a ${label}`
}

/** Detects objects in the frame with COCO-SSD and returns the sentence Oli should speak. */
export async function detectObjectsOffline(imageBase64: string, lang: Lang): Promise<string> {
  const [model, img] = await Promise.all([loadModel(), loadImage(imageBase64)])
  const detections = await model.detect(img, 20, MIN_SCORE)

  const seen = new Set<string>()
  const objects = detections
    .filter((d) => d.score >= MIN_SCORE)
    .sort((a, b) => b.score - a.score)
    .map((d) => ({ label: d.class, direction: directionOf(d.bbox[0], d.bbox[2], img.naturalWidth) }))
    .filter(({ label, direction }) => {
      const key = `${label}:${direction}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, MAX_OBJECTS)

  if (objects.length === 0) return OFFLINE_PATH_CLEAR_MESSAGE[lang]

  if (lang === "ta") {
    const parts = objects.map(({ label, direction }) => `${DIRECTION_TEXT.ta[direction]} ${TAMIL_LABELS[label] ?? label}`)
    return `ஆஃப்லைன் பார்வை முறை: ${joinList(parts, "ta")} தெரிகிறது. கவனமாக நடங்கள்.`
  }
  const parts = objects.map(({ label, direction }) => `${withArticle(label)} ${DIRECTION_TEXT.en[direction]}`)
  return `Offline vision mode: I see ${joinList(parts, "en")}. Walk carefully.`
}
