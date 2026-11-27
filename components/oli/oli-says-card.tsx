import { RotateCcw, VolumeX } from "lucide-react"
import type { Lang, Strings } from "@/lib/oli/i18n"

interface OliSaysCardProps {
  lang: Lang
  t: Strings
  message: string
  heard: string
  onRepeat: () => void
  onStop: () => void
}

export function OliSaysCard({ lang, t, message, heard, onRepeat, onStop }: OliSaysCardProps) {
  return (
    <section aria-labelledby="oli-says-title" className="rounded-3xl border border-border bg-card p-5">
      <h2 id="oli-says-title" className="text-xs font-bold tracking-[0.2em] text-primary">
        {t.oliSays}
      </h2>
      <p role="status" aria-live="polite" aria-atomic="true" lang={lang} className="mt-2 min-h-14 text-xl leading-relaxed text-pretty">
        {message}
      </p>
      {heard ? (
        <p className="mt-3 text-sm text-muted-foreground">
          {t.youSaid}: <span className="font-semibold text-foreground">{`"${heard}"`}</span>
        </p>
      ) : null}
      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onRepeat}
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-primary/60 bg-secondary text-base font-semibold text-foreground hover:bg-primary/15"
        >
          <RotateCcw aria-hidden="true" className="size-5 text-primary" />
          {t.repeat}
        </button>
        <button
          type="button"
          onClick={onStop}
          aria-keyshortcuts="Escape"
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-secondary text-base font-semibold text-foreground hover:bg-destructive/15"
        >
          <VolumeX aria-hidden="true" className="size-5 text-destructive" />
          {t.stopVoice}
        </button>
      </div>
    </section>
  )
}
