import type { Lang } from "./i18n"
import { OFFLINE_OCR_UNCLEAR_MESSAGE } from "./vision-messages"

const MIN_CONFIDENCE = 45
const MIN_READABLE_CHARS = 2
const MAX_SPOKEN_CHARS = 600

const OCR_PREFIX: Record<Lang, string> = {
  en: "I read: ",
  ta: "இதில் எழுதியிருப்பது: ",
}

export function cleanOcrText(raw: string): string {
  return raw
    .replace(/[^\p{L}\p{M}\p{N}\s.,:;!?'"()\-%₹/&@#+]/gu, " ")
    .replace(/([.,:;!?\-_/])\1+/g, "$1")
    .replace(/\s+/g, " ")
    .trim()
}

function readableCharCount(text: string): number {
  return text.match(/[\p{L}\p{N}]/gu)?.length ?? 0
}

const CONTRAST_FACTOR = 1.3

function loadImage(base64: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error("Could not decode frame"))
    img.src = `data:image/jpeg;base64,${base64}`
  })
}

/** Redraws the frame at full size with a mild contrast boost to sharpen text edges. */
async function enhanceForOcr(imageBase64: string): Promise<HTMLCanvasElement | string> {
  const dataUrl = `data:image/jpeg;base64,${imageBase64}`
  const img = await loadImage(imageBase64)
  const canvas = document.createElement("canvas")
  canvas.width = img.naturalWidth
  canvas.height = img.naturalHeight
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return dataUrl

  ctx.drawImage(img, 0, 0)
  const frame = ctx.getImageData(0, 0, canvas.width, canvas.height)
  const px = frame.data
  for (let i = 0; i < px.length; i += 4) {
    px[i] = (px[i] - 128) * CONTRAST_FACTOR + 128
    px[i + 1] = (px[i + 1] - 128) * CONTRAST_FACTOR + 128
    px[i + 2] = (px[i + 2] - 128) * CONTRAST_FACTOR + 128
  }
  ctx.putImageData(frame, 0, 0)
  return canvas
}

/** Reads text in the browser with tesseract.js. Returns the sentence Oli should speak. */
export async function readTextOffline(imageBase64: string, lang: Lang): Promise<string> {
  const [{ default: Tesseract }, image] = await Promise.all([import("tesseract.js"), enhanceForOcr(imageBase64)])
  const result = await Tesseract.recognize(image, lang === "ta" ? "tam+eng" : "eng")
  const text = cleanOcrText(result.data.text ?? "")

  if (result.data.confidence < MIN_CONFIDENCE || readableCharCount(text) < MIN_READABLE_CHARS) {
    return OFFLINE_OCR_UNCLEAR_MESSAGE[lang]
  }
  return `${OCR_PREFIX[lang]}${text.slice(0, MAX_SPOKEN_CHARS)}`
}
