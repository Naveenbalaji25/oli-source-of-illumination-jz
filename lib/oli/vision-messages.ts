import type { Lang } from "./i18n"

export type VisionMode = "obstacles" | "read"

export const OFFLINE_VISION_MESSAGE: Record<Lang, string> = {
  en: "Key not set — offline demo mode. Live camera object and text detection works automatically once GEMINI_API_KEY is added.",
  ta: "விசை அமைக்கப்படவில்லை — ஆஃப்லைன் மாதிரி. GEMINI_API_KEY சேர்க்கப்படும்போது நேரடி கேமரா கணிப்பு இயங்கும்.",
}

export const UNCLEAR_IMAGE_MESSAGE: Record<Lang, string> = {
  en: "The image is blurry or not clear. Please hold steady or adjust the light.",
  ta: "படம் தெளிவாக இல்லை. சற்று அசையாமல் பிடிக்கவும் அல்லது வெளிச்சத்தை சரிசெய்யவும்.",
}
