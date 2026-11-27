import type { Lang, Operation } from "./i18n"

export type Command =
  | { type: "op"; op: Operation }
  | { type: "lang"; lang: Lang }
  | { type: "unknown" }

const LANG_KEYWORDS: Record<Lang, string[]> = {
  ta: ["switch to tamil", "change to tamil", "speak tamil", "tamil", "தமிழ் மாற்று", "தமிழ்"],
  en: ["switch to english", "change to english", "speak english", "english", "ஆங்கிலம்"],
}

const OP_KEYWORDS: [Operation, string[]][] = [
  ["sos", ["emergency", "sos", "s o s", "help me", "help", "அவசர உதவி", "அவசரம்", "உதவி"]],
  ["read", ["read text", "read", "text", "sign", "எழுத்தைப் படி", "படி"]],
  ["obstacles", ["what's ahead", "whats ahead", "what is ahead", "obstacle", "ahead", "front", "look", "முன்னால் என்ன", "முன்னால்", "தடை"]],
  ["location", ["where am i", "location", "where", "address", "நான் எங்கே", "எங்கே", "இடம்"]],
]

function normalize(input: string): string {
  return input
    .toLowerCase()
    .replace(/[.,!?;:"“”]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

function containsWord(haystack: string, keyword: string): boolean {
  if (/[\u0B80-\u0BFF]/.test(keyword)) return haystack.includes(keyword)
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
  return new RegExp(`(^|\\s)${escaped}(s)?(\\s|$)`).test(haystack)
}

export function parseCommand(transcript: string): Command {
  const text = normalize(transcript)
  if (!text) return { type: "unknown" }

  const sos = OP_KEYWORDS[0]
  if (sos[1].some((k) => containsWord(text, k))) return { type: "op", op: "sos" }

  for (const lang of ["ta", "en"] as Lang[]) {
    if (LANG_KEYWORDS[lang].some((k) => containsWord(text, k))) return { type: "lang", lang }
  }

  for (const [op, keywords] of OP_KEYWORDS.slice(1)) {
    if (keywords.some((k) => containsWord(text, k))) return { type: "op", op }
  }
  return { type: "unknown" }
}
