import { BookOpenText, Footprints, MapPin, Siren, type LucideIcon } from "lucide-react"
import type { Operation, Strings } from "@/lib/oli/i18n"
import { cn } from "@/lib/utils"

const OPERATIONS: { op: Operation; key: string; icon: LucideIcon }[] = [
  { op: "location", key: "1", icon: MapPin },
  { op: "obstacles", key: "2", icon: Footprints },
  { op: "read", key: "3", icon: BookOpenText },
  { op: "sos", key: "4", icon: Siren },
]

interface OperationGridProps {
  t: Strings
  busy: Operation | null
  onSelect: (op: Operation) => void
}

export function OperationGrid({ t, busy, onSelect }: OperationGridProps) {
  return (
    <nav aria-label="Oli actions">
      <ul className="grid grid-cols-2 gap-3">
        {OPERATIONS.map(({ op, key, icon: Icon }) => {
          const isSos = op === "sos"
          const label = t.ops[op]
          return (
            <li key={op}>
              <button
                type="button"
                onClick={() => onSelect(op)}
                aria-keyshortcuts={key}
                aria-busy={busy === op}
                className={cn(
                  "relative flex min-h-36 w-full flex-col items-start justify-between gap-3 rounded-3xl border-2 p-4 text-left transition-colors",
                  isSos
                    ? "border-destructive bg-destructive/15 hover:bg-destructive/25"
                    : "border-border bg-card hover:border-primary hover:bg-primary/10",
                  busy === op && "border-primary",
                )}
              >
                <span className="flex w-full items-center justify-between">
                  <Icon aria-hidden="true" className={cn("size-9", isSos ? "text-destructive" : "text-primary")} />
                  <kbd aria-hidden="true" className="rounded-lg border border-border px-2 py-0.5 font-mono text-sm text-muted-foreground">
                    {key}
                  </kbd>
                </span>
                <span>
                  <span className="block text-xl font-bold leading-tight">{label.title}</span>
                  <span className="mt-1 block text-sm text-muted-foreground">{label.hint}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
