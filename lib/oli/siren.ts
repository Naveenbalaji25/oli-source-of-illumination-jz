type AudioContextCtor = typeof AudioContext

let ctx: AudioContext | null = null

function getContext(): AudioContext | null {
  if (typeof window === "undefined") return null
  const Ctor: AudioContextCtor | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
  if (!Ctor) return null
  ctx ??= new Ctor()
  if (ctx.state === "suspended") void ctx.resume()
  return ctx
}

export function unlockAudio(): void {
  getContext()
}

export function playSiren(beeps = 3): Promise<void> {
  const audio = getContext()
  if (!audio) return Promise.resolve()

  const beepLength = 0.42
  const gap = 0.16
  const start = audio.currentTime + 0.05

  for (let i = 0; i < beeps; i++) {
    const t = start + i * (beepLength + gap)
    const osc = audio.createOscillator()
    const gain = audio.createGain()
    osc.type = "square"
    osc.frequency.setValueAtTime(720, t)
    osc.frequency.linearRampToValueAtTime(1180, t + beepLength * 0.6)
    osc.frequency.linearRampToValueAtTime(880, t + beepLength)
    gain.gain.setValueAtTime(0.0001, t)
    gain.gain.exponentialRampToValueAtTime(0.28, t + 0.03)
    gain.gain.setValueAtTime(0.28, t + beepLength - 0.05)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + beepLength)
    osc.connect(gain).connect(audio.destination)
    osc.start(t)
    osc.stop(t + beepLength + 0.02)
  }

  const totalMs = (beeps * (beepLength + gap) + 0.1) * 1000
  return new Promise((resolve) => setTimeout(resolve, totalMs))
}

export function haptic(pattern: number | number[] = 40): void {
  if (typeof navigator !== "undefined" && "vibrate" in navigator) {
    try {
      navigator.vibrate(pattern)
    } catch {
      /* vibration not permitted */
    }
  }
}
