import type { Lang } from "./i18n"
import type { VisionMode } from "./vision-messages"

export type { VisionMode }

export interface VisionResult {
  text: string
  source: "gemini" | "offline"
}

const HIGH_RES: MediaTrackConstraints = { width: { ideal: 1920 }, height: { ideal: 1080 } }

/** Opens the rear camera when available, otherwise any camera. */
export async function openCamera(): Promise<MediaStream> {
  if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
    throw new Error("Camera API unavailable")
  }
  try {
    return await navigator.mediaDevices.getUserMedia({
      video: { facingMode: { ideal: "environment" }, ...HIGH_RES },
      audio: false,
    })
  } catch {
    return navigator.mediaDevices.getUserMedia({ video: HIGH_RES, audio: false })
  }
}

export function stopStream(stream: MediaStream | null): void {
  stream?.getTracks().forEach((track) => track.stop())
}

function isBlankFrame(ctx: CanvasRenderingContext2D, width: number, height: number): boolean {
  const { data } = ctx.getImageData(0, 0, width, height)
  const step = 4 * 37
  let min = 255
  let max = 0
  for (let i = 0; i < data.length; i += step) {
    const luma = (data[i] * 299 + data[i + 1] * 587 + data[i + 2] * 114) / 1000
    if (luma < min) min = luma
    if (luma > max) max = luma
  }
  return max < 12 || max - min < 6
}

/** True when the stream comes from a user-facing camera, whose preview should be mirrored. */
export function isUserFacing(stream: MediaStream): boolean {
  const facing = stream.getVideoTracks()[0]?.getSettings().facingMode
  return facing !== "environment"
}

/**
 * Captures a fresh frame at the video's full native resolution as base64 JPEG,
 * or null if the frame is blank. The capture is never mirrored, even when the
 * on-screen preview is, so text stays readable and left/right stay correct.
 */
export function captureFrame(video: HTMLVideoElement): string | null {
  if (video.readyState < HTMLMediaElement.HAVE_CURRENT_DATA || !video.videoWidth || !video.videoHeight) return null
  const canvas = document.createElement("canvas")
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const ctx = canvas.getContext("2d", { willReadFrequently: true })
  if (!ctx) return null
  ctx.setTransform(1, 0, 0, 1, 0, 0)
  ctx.imageSmoothingEnabled = false
  ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
  if (isBlankFrame(ctx, canvas.width, canvas.height)) return null
  const dataUrl = canvas.toDataURL("image/jpeg", 0.85)
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
