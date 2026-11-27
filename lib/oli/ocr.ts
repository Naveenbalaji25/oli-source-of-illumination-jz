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

/** Reads text in the browser with tesseract.js. Returns the sentence Oli should speak. */
export async function readTextOffline(imageBase64: string, lang: Lang): Promise<string> {
  const { default: Tesseract } = await import("tesseract.js")
  const result = await Tesseract.recognize(`data:image/jpeg;base64,${imageBase64}`, lang === "ta" ? "tam+eng" : "eng")
  const text = cleanOcrText(result.data.text ?? "")

  if (result.data.confidence < MIN_CONFIDENCE || readableCharCount(text) < MIN_READABLE_CHARS) {
    return OFFLINE_OCR_UNCLEAR_MESSAGE[lang]
  }
  return `${OCR_PREFIX[lang]}${text.slice(0, MAX_SPOKEN_CHARS)}`
}
