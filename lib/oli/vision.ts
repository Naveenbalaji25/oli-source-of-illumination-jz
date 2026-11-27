import type { Lang } from "./i18n"
import type { VisionMode } from "./samples"

export type { VisionMode }

export interface VisionResult {
  text: string
  source: "gemini" | "offline"
}

const MAX_FRAME_WIDTH = 768

/** Opens the rear camera when available, otherwise any camera. */
export async function openCamera(): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera API unavailable")
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" } },
      audio: false,
    })
  } catch {
    return navigator.mediaDevices.getUserMedia({ video: true, audio: false })
  }
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop())
}

/** Captures the current video frame as base64 JPEG (without the data: prefix). */
export function captureFrame(video: HTMLVideoElement): string | null {
  if (!video.videoWidth || !video.videoHeight) return null
  const scale = Math.min(1, MAX_FRAME_WIDTH / video.videoWidth)
  const canvas = document.createElement("canvas")
  canvas.width = Math.round(video.videoWidth * scale)
  canvas.height = Math.round(video.videoHeight * scale)
  const ctx = canvas.getContext("2d")
  if (!ctx) return null
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  const dataUrl = canvas.toDataURL("image/jpeg", 0.72)
  return dataUrl.split(",")[1] ?? null
}

export async function analyzeFrame(params: {
  image: string | null
  mode: VisionMode
  lang: Lang
}): Promise<VisionResult> {
  const res = await fetch("/api/vision", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(params),
    signal: AbortSignal.timeout(25000),
  })
  if (!res.ok) throw new Error(`Vision ${res.status}`)
  const data = (await res.json()) as { text?: string; offline?: boolean }
  if (!data.text) throw new Error("Empty vision response")
  return { text: data.text, source: data.offline ? "offline" : "gemini" }
}

/** Ensures model output is short, plain speech: no markdown, bullets or emoji. */
export function toSpokenSentence(raw: string, maxWords = 35): string {
  const cleaned = raw
    .replace(/[*_#`>~|]/g, "")
    .replace(/^\s*[-•\d]+[.)]?\s+/gm, "")
    .replace(/[\p{Extended_Pictographic}\uFE0F]/gu, "")
    .replace(/\s+/g, " ")
    .trim()
  const words = cleaned.split(" ")
  if (words.length <= maxWords) return cleaned
  const clipped = words.slice(0, maxWords).join(" ")
  const lastStop = Math.max(clipped.lastIndexOf("."), clipped.lastIndexOf("।"))
  return lastStop > clipped.length * 0.5 ? clipped.slice(0, lastStop + 1) : `${clipped}.`
}
