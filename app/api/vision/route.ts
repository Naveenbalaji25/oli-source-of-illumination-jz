import { OFFLINE_VISION_MESSAGE, UNCLEAR_IMAGE_MESSAGE, type VisionMode } from "@/lib/oli/vision-messages"
import { toSpokenSentence } from "@/lib/oli/vision"
import type { Lang } from "@/lib/oli/i18n"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent"
const MAX_IMAGE_BASE64 = 4_000_000

const LANGUAGE_NAME: Record<Lang, string> = { en: "simple English", ta: "simple spoken Tamil" }

const systemInstruction = (lang: Lang) =>
  [
    `Reply in ${LANGUAGE_NAME[lang]} only.`,
    "Output plain spoken sentences ONLY. No markdown, asterisks, bullets, numbering, symbols or emojis.",
    "Describe ONLY what is clearly visible in this fresh camera frame right now, in 1 to 2 very simple everyday sentences.",
    "Never guess or invent objects, places, signs, bus stops, vehicles, or medicine names that are not clearly visible.",
    `If the image is blurry, dark, glared, or unclear, say ONLY this exact sentence: "${UNCLEAR_IMAGE_MESSAGE[lang]}"`,
  ].join(" ")

const TASKS: Record<VisionMode, string> = {
  obstacles:
    "Tell my blind friend in 1 to 2 simple sentences only what real objects or obstacles are visible right in front of them, saying whether each is on the left, right, or straight ahead. Or say it is blurry or not clear.",
  read:
    "Read only the actual printed or handwritten letters, numbers, or words visible in this photo, in simple words. Or say the text is blurry or not clear.",
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

  if (!apiKey) return Response.json({ text: OFFLINE_VISION_MESSAGE[lang], offline: true })
  if (!image) return Response.json({ text: UNCLEAR_IMAGE_MESSAGE[lang], offline: false })
  if (image.length > MAX_IMAGE_BASE64 || !/^[A-Za-z0-9+/=]+$/.test(image)) {
    return Response.json({ error: "Invalid image" }, { status: 400 })
  }

  try {
    const res = await fetch(GEMINI_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      signal: AbortSignal.timeout(20000),
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: systemInstruction(lang) }] },
        contents: [
          {
            role: "user",
            parts: [
              { text: TASKS[mode] },
              { inline_data: { mime_type: "image/jpeg", data: image } },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100,
          thinkingConfig: { thinkingBudget: 0 },
        },
      }),
    })

    if (!res.ok) {
      console.error("[oli] Gemini error", res.status, (await res.text()).slice(0, 300))
      return Response.json({ error: "Vision service unavailable" }, { status: 502 })
    }

    const data = (await res.json()) as {
      candidates?: { content?: { parts?: { text?: string }[] } }[]
    }
    const raw = data.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join(" ") ?? ""
    const text = toSpokenSentence(raw) || UNCLEAR_IMAGE_MESSAGE[lang]

    return Response.json({ text, offline: false })
  } catch (error) {
    console.error("[oli] Gemini request failed:", (error as Error).message)
    return Response.json({ error: "Vision service unavailable" }, { status: 502 })
  }
}
