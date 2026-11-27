import { MapPinned, MessageCircle, Phone } from "lucide-react"
import type { Strings } from "@/lib/oli/i18n"

export interface SosState {
  mapsUrl?: string
  place?: string
}

interface SosPanelProps {
  t: Strings
  sos: SosState
}

export function SosPanel({ t, sos }: SosPanelProps) {
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(t.whatsappText(sos.mapsUrl))}`

  return (
    <section aria-label={t.ops.sos.title} className="flex flex-col gap-3 rounded-3xl border-2 border-destructive bg-destructive/10 p-4">
      <a
        href={whatsappUrl}
        target="_blank"
        rel="noopener noreferrer"
        autoFocus
        className="flex min-h-20 items-center justify-center gap-3 rounded-2xl bg-success px-4 text-center text-lg font-bold text-[#052e16] hover:brightness-110"
      >
        <MessageCircle aria-hidden="true" className="size-7 shrink-0" />
        {t.sendWhatsApp}
      </a>
      {sos.place ? <p className="text-center text-base text-foreground">{sos.place}</p> : null}
      <div className={sos.mapsUrl ? "grid grid-cols-2 gap-3" : "grid grid-cols-1 gap-3"}>
        <a
          href="tel:112"
          className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-destructive bg-secondary px-2 text-center text-sm font-bold"
        >
          <Phone aria-hidden="true" className="size-5 text-destructive" />
          {t.call112}
        </a>
        {sos.mapsUrl ? (
          <a
            href={sos.mapsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-border bg-secondary px-2 text-center text-sm font-semibold"
          >
            <MapPinned aria-hidden="true" className="size-5 text-primary" />
            {t.viewMap}
          </a>
        ) : null}
      </div>
    </section>
  )
}
