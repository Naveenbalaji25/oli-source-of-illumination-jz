import { Mic } from "lucide-react"
import type { Strings } from "@/lib/oli/i18n"
import { cn } from "@/lib/utils"

interface MicButtonProps {
  t: Strings
  listening: boolean
  onPress: () => void
}

export function MicButton({ t, listening, onPress }: MicButtonProps) {
  return (
    <div className="flex flex-col items-center gap-3 py-2">
      <button
        type="button"
        onClick={onPress}
        aria-pressed={listening}
        aria-keyshortcuts="M Space"
        aria-label={listening ? t.listening : t.tapAndSpeak}
        className={cn(
          "flex size-44 items-center justify-center rounded-full bg-primary text-primary-foreground transition-transform active:scale-95 sm:size-52",
          listening ? "oli-listening" : "oli-glow",
        )}
      >
        <Mic aria-hidden="true" className="size-20" strokeWidth={2.25} />
      </button>
      <p aria-hidden="true" className="text-xl font-bold text-primary">
        {listening ? t.listening : t.tapAndSpeak}
      </p>
    </div>
  )
}
