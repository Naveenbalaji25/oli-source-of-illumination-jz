import type { Lang } from "./i18n"

export type VisionMode = "obstacles" | "read"

export const OFFLINE_SAMPLES: Record<VisionMode, Record<Lang, string[]>> = {
  obstacles: {
    en: [
      "The path ahead is mostly clear. There is a parked two-wheeler about two meters ahead on your left, so keep slightly right and walk straight. I'm right here with you.",
      "Careful, a step goes down about one meter straight ahead. Slow down, feel for the edge with your foot, then continue. You're doing well.",
      "A tea stall bench is about three meters ahead on your right. The middle of the path is open, so walk straight with small steps.",
      "I can't see the ground clearly. Please tilt the camera slightly down so I can check your walking path for you.",
    ],
    ta: [
      "முன்னால் பாதை பெரும்பாலும் தெளிவாக உள்ளது. இடது பக்கம் இரண்டு மீட்டரில் ஒரு இருசக்கர வாகனம் நிற்கிறது, சற்று வலப்பக்கம் நேராக நடங்கள். நான் உங்களுடன் இருக்கிறேன்.",
      "கவனம், நேராக ஒரு மீட்டரில் ஒரு படி கீழே இறங்குகிறது. மெதுவாக, காலால் விளிம்பை உணர்ந்து பிறகு தொடருங்கள். நன்றாகச் செய்கிறீர்கள்.",
      "வலது பக்கம் மூன்று மீட்டரில் ஒரு டீக்கடை பெஞ்ச் உள்ளது. நடுப்பாதை திறந்திருக்கிறது, சிறு அடிகளில் நேராக நடங்கள்.",
      "தரை தெளிவாகத் தெரியவில்லை. கேமராவை சற்று கீழே சாய்த்துப் பிடியுங்கள், உங்கள் பாதையைப் பார்க்கிறேன்.",
    ],
  },
  read: {
    en: [
      "The sign says: Anna Salai, Bus Stop. Route 21G to Broadway. It's written in English and Tamil.",
      "The label reads: Paracetamol tablets, 500 milligrams. Take one tablet after food. Expiry date, March 2028.",
      "The board says: Chennai Central Metro Station, Entry, with an arrow pointing to your right.",
      "The text is a little blurry. Please hold steady and tilt the paper slightly to reduce glare, and I'll read it again.",
    ],
    ta: [
      "பலகையில் எழுதியிருப்பது: அண்ணா சாலை, பேருந்து நிறுத்தம். பிராட்வே செல்லும் 21ஜி பேருந்து.",
      "லேபிளில் உள்ளது: பாராசிட்டமால் மாத்திரை, 500 மில்லிகிராம். உணவுக்குப் பிறகு ஒரு மாத்திரை. காலாவதி மார்ச் 2028.",
      "பலகையில்: சென்னை சென்ட்ரல் மெட்ரோ நிலையம், நுழைவு, உங்கள் வலப்பக்கம் அம்புக்குறி.",
      "எழுத்து சற்று மங்கலாக உள்ளது. நிலையாகப் பிடித்து, ஒளி பிரதிபலிப்பு குறைய சற்று சாய்த்துப் பிடியுங்கள், மீண்டும் படிக்கிறேன்.",
    ],
  },
}

export function pickOfflineSample(mode: VisionMode, lang: Lang): string {
  const pool = OFFLINE_SAMPLES[mode][lang]
  return pool[Math.floor(Math.random() * pool.length)]
}
