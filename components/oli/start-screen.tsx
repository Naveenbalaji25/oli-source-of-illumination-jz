import { Power } from "lucide-react"
import type { Strings } from "@/lib/oli/i18n"

interface StartScreenProps {
  t: Strings
  onStart: () => void
}

export function StartScreen({ t, onStart }: StartScreenProps) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 py-8 text-center">
      <button
        type="button"
        autoFocus
        onClick={onStart}
        aria-describedby="start-hint"
        className="oli-glow flex aspect-square w-full max-w-sm flex-col items-center justify-center gap-4 rounded-full bg-primary text-primary-foreground transition-transform active:scale-95"
      >
        <Power aria-hidden="true" className="size-20" strokeWidth={2.5} />
        <span className="text-3xl font-bold">{t.startTitle}</span>
        <span className="text-lg font-semibold" lang="ta">
          ஒளியைத் தொடங்கு
        </span>
      </button>
      <p id="start-hint" className="max-w-md text-pretty text-base leading-relaxed text-muted-foreground">
        {t.startHint}
      </p>
    </div>
  )
}
