import { Sparkles, WifiOff } from "lucide-react"
import type { Lang, Strings } from "@/lib/oli/i18n"
import { cn } from "@/lib/utils"

interface AppHeaderProps {
  lang: Lang
  t: Strings
  offline: boolean
  onLangChange: (lang: Lang) => void
}

export function AppHeader({ lang, t, offline, onLangChange }: AppHeaderProps) {
  return (
    <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <div aria-hidden="true" className="oli-glow flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Sparkles className="size-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold leading-tight text-balance">
            {t.appName} <span className="text-primary">·</span>{" "}
            <span className="text-base font-semibold text-muted-foreground">{t.tagline}</span>
          </h1>
          <p className="text-sm text-muted-foreground" lang={lang === "en" ? "ta" : "en"}>
            {lang === "en" ? "ஒளி — பிரகாசத்தின் மூலம்" : "Oli — Source of Illumination"}
          </p>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold",
            offline ? "border-primary/50 bg-primary/10 text-primary" : "border-success/50 bg-success/10 text-success",
          )}
        >
          {offline ? <WifiOff aria-hidden="true" className="size-3.5" /> : <Sparkles aria-hidden="true" className="size-3.5" />}
          {offline ? t.offlinePill : t.livePill}
        </span>

        <div role="group" aria-label="Language / மொழி" className="inline-flex rounded-full border border-border bg-card p-1">
          {(["en", "ta"] as const).map((code) => (
            <button
              key={code}
              type="button"
              lang={code}
              aria-pressed={lang === code}
              onClick={() => onLangChange(code)}
              className={cn(
                "min-h-10 rounded-full px-4 text-sm font-semibold transition-colors",
                lang === code ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary",
              )}
            >
              {code === "en" ? "English" : "தமிழ்"}
            </button>
          ))}
        </div>
      </div>
    </header>
  )
}
