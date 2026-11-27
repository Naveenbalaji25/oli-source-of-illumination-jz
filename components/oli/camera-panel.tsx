"use client"

import { useEffect, useRef, useState } from "react"
import { Camera, ScanLine, X } from "lucide-react"
import type { Strings } from "@/lib/oli/i18n"
import { captureFrame, isUserFacing, openCamera, stopStream, type VisionMode } from "@/lib/oli/vision"

interface CameraPanelProps {
  t: Strings
  mode: VisionMode
  scanning: boolean
  onFrame: (image: string | null) => void
  onClose: () => void
}

const SETTLE_DELAY_MS = 900

export function CameraPanel({ t, mode, scanning, onFrame, onClose }: CameraPanelProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const autoCaptured = useRef(false)
  const [noCamera, setNoCamera] = useState(false)
  const [mirrored, setMirrored] = useState(false)

  useEffect(() => {
    let cancelled = false
    openCamera()
      .then((stream) => {
        if (cancelled) return stopStream(stream)
        streamRef.current = stream
        setMirrored(isUserFacing(stream))
        if (videoRef.current) videoRef.current.srcObject = stream
      })
      .catch(() => {
        if (cancelled) return
        setNoCamera(true)
        onFrame(null)
      })
    return () => {
      cancelled = true
      stopStream(streamRef.current)
      streamRef.current = null
    }
    // The camera opens once per panel; onFrame identity changes must not reopen it.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const capture = () => {
    const video = videoRef.current
    onFrame(video && !noCamera ? captureFrame(video) : null)
  }

  const handlePlaying = () => {
    if (autoCaptured.current) return
    autoCaptured.current = true
    setTimeout(capture, SETTLE_DELAY_MS)
  }

  return (
    <section aria-label={mode === "read" ? t.ops.read.title : t.ops.obstacles.title} className="rounded-3xl border-2 border-primary bg-card p-3">
      <div className="relative aspect-video overflow-hidden rounded-2xl bg-background">
        {noCamera ? (
          <div className="flex h-full flex-col items-center justify-center gap-2 p-4 text-center text-muted-foreground">
            <Camera aria-hidden="true" className="size-10 text-primary" />
            <p>{t.sampleScene}</p>
          </div>
        ) : (
          <video
            ref={videoRef}
            autoPlay
            muted
            playsInline
            onPlaying={handlePlaying}
            aria-hidden="true"
            className={mirrored ? "h-full w-full -scale-x-100 object-cover" : "h-full w-full object-cover"}
          />
        )}
        {scanning ? (
          <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 animate-pulse bg-primary" />
        ) : null}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={capture}
          disabled={scanning}
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-primary text-base font-bold text-primary-foreground disabled:opacity-60"
        >
          <ScanLine aria-hidden="true" className="size-5" />
          {scanning ? t.lookingNow : t.scanAgain}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-secondary text-base font-semibold"
        >
          <X aria-hidden="true" className="size-5" />
          {t.closeCamera}
        </button>
      </div>
    </section>
  )
}
