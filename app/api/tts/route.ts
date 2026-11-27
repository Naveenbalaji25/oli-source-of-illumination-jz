import { MsEdgeTTS, OUTPUT_FORMAT } from "msedge-tts"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const VOICES = {
  en: "en-IN-NeerjaNeural",
  ta: "ta-IN-PallaviNeural",
} as const

const MAX_TEXT_LENGTH = 800
const SYNTH_TIMEOUT_MS = 10000

function escapeXml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;")
}

async function synthesize(text: string, voice: string): Promise<Buffer> {
  const tts = new MsEdgeTTS()
  try {
    await tts.setMetadata(voice, OUTPUT_FORMAT.AUDIO_24KHZ_48KBITRATE_MONO_MP3)
    const { audioStream } = tts.toStream(escapeXml(text), { rate: "-8%", pitch: "+4Hz" })

    return await new Promise<Buffer>((resolve, reject) => {
      const chunks: Buffer[] = []
      const timer = setTimeout(() => reject(new Error("TTS timeout")), SYNTH_TIMEOUT_MS)
      audioStream.on("data", (chunk: Buffer) => chunks.push(chunk))
      audioStream.on("error", (err) => {
        clearTimeout(timer)
        reject(err)
      })
      audioStream.on("end", () => {
        clearTimeout(timer)
        resolve(Buffer.concat(chunks))
      })
    })
  } finally {
    tts.close()
  }
}

export async function POST(req: Request) {
  let body: { text?: unknown; lang?: unknown }
  try {
    body = await req.json()
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 })
  }

  const text = typeof body.text === "string" ? body.text.trim() : ""
  const lang = body.lang === "ta" ? "ta" : "en"
  if (!text || text.length > MAX_TEXT_LENGTH) {
    return Response.json({ error: "Text must be 1-800 characters" }, { status: 400 })
  }

  try {
    const audio = await synthesize(text, VOICES[lang])
    if (audio.length === 0) throw new Error("Empty audio")
    return new Response(new Uint8Array(audio), {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Length": String(audio.length),
        "Cache-Control": "private, max-age=3600",
      },
    })
  } catch (error) {
    console.error("[oli] TTS failed, client will use browser voice:", (error as Error).message)
    return Response.json({ error: "Neural voice unavailable" }, { status: 503 })
  }
}
