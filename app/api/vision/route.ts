import { pickOfflineSample, type VisionMode } from "@/lib/oli/samples"
import { toSpokenSentence } from "@/lib/oli/vision"
import type { Lang } from "@/lib/oli/i18n"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
const MAX_IMAGE_BASE64 = 4_000_000

const LANGUAGE_NAME: Record<Lang, string> = { en: "simple Indian English", ta: "simple spoken Tamil" }

const PERSONA =
  "You are Oli, a warm, caring companion who speaks like a kind Indian elder sister to a blind or visually impaired person in Chennai, Tamil Nadu. Your words are read aloud by a voice engine."

const OUTPUT_RULES = (lang: Lang) =>
  `Reply in ${LANGUAGE_NAME[lang]} only. Use plain spoken sentences only. Strictly no markdown, asterisks, bullets, numbered lists, symbols or emojis. Keep the whole reply under 35 words.`

const TASKS: Record<VisionMode, string> = {
  obstacles:
    "Look at this camera frame from the person's point of view. Describe the most important objects and immediate path obstacles 1 to 4 meters ahead, with an approximate distance and a clear direction: left, right, or straight ahead. Mention steps, potholes, vehicles, poles, people or animals first. Then say which way is safest to walk. If the walking path or ground is not visible, kindly ask them to tilt the camera slightly down.",
  read:
    "Read all printed or handwritten text in this image aloud exactly, such as signs, labels, bus boards, medicine strips or documents. Start with the largest or most important text. If the text is blurry, cut off or has glare, kindly ask them to hold steady and tilt slightly to reduce glare.",
}

function offline(mode: VisionMode, lang: Lang, reason: string) {
  return Response.json({ text: pickOfflineSample(mode, lang), offline: true, reason })
}

export async function POST(req: Request) {
  let body: { image?: unknown; mode?: unknown; lang?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const mode: VisionMode = body.mode === "read" ? "read" : "obstacles"
  const lang: Lang = body.lang === "ta" ? "ta" : "en"
  const image = typeof body.image === "string" ? body.image : ""
  const apiKey = process.env.GEMINI_API_KEY?.trim()

  if (!apiKey) return offline(mode, lang, "no-key")
  if (!image) return offline(mode, lang, "no-camera")
  if (image.length > MAX_IMAGE_BASE64 || !/^[A-Za-z0-9+/=]+$/.test(image)) {
    return Response.json({ error: "Invalid image" }, { status: 400 })
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: `${PERSONA} ${OUTPUT_RULES(lang)}` }] },
        contents: [
          {
            role: "user",
            parts: [
              { text: `${TASKS[mode]} ${OUTPUT_RULES(lang)}` },
              { inline_data: { mime_type: "image/jpeg", data: image } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.4,
          maxOutputTokens: 256,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })

    if (!res.ok) {
      console.error("[oli] Gemini error", res.status, (await res.text()).slice(0, 300))
      return offline(mode, lang, `gemini-${res.status}`)
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join(" ") ?? ""
    const text = toSpokenSentence(raw)
    if (!text) return offline(mode, lang, "empty")

    return Response.json({ text, offline: false })
  } catch (error) {
    console.error("[oli] Gemini request failed:", (error as Error).message)
    return offline(mode, lang, "network")
  }
}
