export type Lang = "en" | "ta"
export type Operation = "location" | "obstacles" | "read" | "sos"

export const SPEECH_LOCALE: Record<Lang, string> = {
  en: "en-IN",
  ta: "ta-IN",
}

export interface AddressParts {
  street?: string
  area?: string
  city?: string
  display?: string
}

export const STRINGS = {
  en: {
    appName: "Oli",
    tagline: "Source of Illumination",
    offlinePill: "Key not set — Zero-Key Offline Demo",
    livePill: "Gemini Vision Live",
    oliSays: "OLI SAYS",
    youSaid: "You said",
    tapAndSpeak: "Tap and speak",
    listening: "Listening…",
    repeat: "Repeat",
    stopVoice: "Stop voice",
    closeCamera: "Close camera",
    scanAgain: "Scan again",
    startTitle: "Start Oli",
    startHint: "Tap anywhere on this button or press Enter. Oli will ask for camera, microphone and location access.",
    shortcuts: "Keys: M or Space to speak, 1 Location, 2 Obstacles, 3 Read text, 4 SOS, Escape to stop voice.",
    sendWhatsApp: "Send WhatsApp SOS with live location",
    call112: "Call 112 emergency",
    viewMap: "Open my pin in Google Maps",
    sampleScene: "No camera found — using a sample scene so you can still try Oli.",
    ops: {
      location: { title: "Where am I?", hint: "Speak my street and area" },
      obstacles: { title: "What's ahead?", hint: "Describe my walking path" },
      read: { title: "Read text", hint: "Read signs and labels" },
      sos: { title: "Emergency SOS", hint: "Siren and live location" },
    },
    greeting:
      "I'm right here with you. I'm Oli, your friend. Do not fear at all—tap the big gold button and say location, obstacles, read, or SOS, and I'll guide you safely.",
    switched: "Switched to English. I'm right here with you, take your time.",
    findingLocation: "Let me find where you are. One moment, I'm with you.",
    locationDenied:
      "I couldn't reach your location. Please allow location access in your browser settings, and I'll try again with you.",
    noSpeech:
      "Voice listening isn't available in this browser. You can tap the four big buttons or press keys one to four instead.",
    didNotCatch:
      "I didn't quite catch that. No hurry—tap the gold button and say location, obstacles, read, or SOS.",
    openingCamera: "Opening the camera. Hold your phone steady at chest height, pointing forward.",
    openingCameraRead: "Opening the camera. Hold the text about a hand's length away and keep it steady.",
    lookingNow: "Looking now…",
    visionError: "I couldn't see clearly just now. Let's try once more—hold steady for me.",
    sosStart:
      "I'm right here with you. Stay calm, help is on the way. I'm getting your live location now.",
    sosReady: (where: string) =>
      `Your SOS is ready. You are near ${where}. Tap the big green WhatsApp button to send your live location to someone you trust.`,
    sosNoLocation:
      "I couldn't get your location, but your SOS message is ready. Tap the big green WhatsApp button, or call one one two.",
    describeLocation: (a: AddressParts) => {
      const parts = [a.street, a.area, a.city].filter(Boolean)
      if (parts.length === 0) return `You are near ${a.display ?? "an unnamed place"}. I'm right here with you.`
      return `You are on ${parts.join(", ")}. Take your time, I'm right here with you.`
    },
    whatsappText: (mapsUrl?: string) =>
      mapsUrl ? `EMERGENCY SOS! My live location: ${mapsUrl}` : "EMERGENCY SOS! Please help me, I need assistance.",
  },
  ta: {
    appName: "ஒளி",
    tagline: "பிரகாசத்தின் மூலம்",
    offlinePill: "சாவி இல்லை — ஆஃப்லைன் டெமோ",
    livePill: "ஜெமினி பார்வை நேரலை",
    oliSays: "ஒளி சொல்கிறது",
    youSaid: "நீங்கள் சொன்னது",
    tapAndSpeak: "தட்டிப் பேசுங்கள்",
    listening: "கேட்கிறேன்…",
    repeat: "மீண்டும்",
    stopVoice: "குரலை நிறுத்து",
    closeCamera: "கேமராவை மூடு",
    scanAgain: "மீண்டும் பார்",
    startTitle: "ஒளியைத் தொடங்கு",
    startHint: "இந்த பொத்தானைத் தட்டவும் அல்லது Enter அழுத்தவும். கேமரா, மைக், இருப்பிட அனுமதி கேட்கப்படும்.",
    shortcuts: "விசைகள்: M அல்லது Space பேச, 1 இடம், 2 முன்னால், 3 படி, 4 அவசரம், Escape குரலை நிறுத்த.",
    sendWhatsApp: "வாட்ஸ்அப்பில் நேரடி இருப்பிடத்துடன் அவசர செய்தி அனுப்பு",
    call112: "112 அவசர அழைப்பு",
    viewMap: "கூகுள் மேப்ஸில் என் இருப்பிடம்",
    sampleScene: "கேமரா இல்லை — மாதிரி காட்சியுடன் முயற்சிக்கலாம்.",
    ops: {
      location: { title: "நான் எங்கே?", hint: "என் தெரு மற்றும் பகுதி" },
      obstacles: { title: "முன்னால் என்ன?", hint: "என் பாதையை விவரி" },
      read: { title: "எழுத்தைப் படி", hint: "பலகைகள், லேபிள்கள்" },
      sos: { title: "அவசர உதவி", hint: "சைரன், நேரடி இருப்பிடம்" },
    },
    greeting:
      "கவலைப்படாதீர்கள், நான் உங்களுடனேயே இருக்கிறேன். நான் உங்கள் ஒளி. தட்டிப் பேசுங்கள்: இடம், முன்னால் என்ன, எழுத்தைப் படி, அல்லது அவசர உதவி—நான் பாதுகாப்பாக வழிகாட்டுவேன்.",
    switched: "மொழி தமிழுக்கு மாற்றப்பட்டது. கவலைப்படாதீர்கள், நான் உங்களுடனேயே இருக்கிறேன்.",
    findingLocation: "நீங்கள் எங்கே இருக்கிறீர்கள் என்று பார்க்கிறேன். ஒரு நிமிடம், நான் உங்களுடன் இருக்கிறேன்.",
    locationDenied:
      "உங்கள் இருப்பிடம் கிடைக்கவில்லை. உலாவியில் இருப்பிட அனுமதியை இயக்குங்கள், மீண்டும் முயற்சிப்போம்.",
    noSpeech:
      "இந்த உலாவியில் குரல் கேட்பு இல்லை. நான்கு பெரிய பொத்தான்களைத் தட்டலாம், அல்லது ஒன்று முதல் நான்கு விசைகளை அழுத்தலாம்.",
    didNotCatch:
      "சரியாகக் கேட்கவில்லை. அவசரமில்லை—தங்கப் பொத்தானைத் தட்டி இடம், முன்னால் என்ன, படி, அல்லது உதவி என்று சொல்லுங்கள்.",
    openingCamera: "கேமராவைத் திறக்கிறேன். தொலைபேசியை மார்பு உயரத்தில் முன்னோக்கி நிலையாகப் பிடியுங்கள்.",
    openingCameraRead: "கேமராவைத் திறக்கிறேன். எழுத்தை ஒரு கை தூரத்தில் நிலையாகப் பிடியுங்கள்.",
    lookingNow: "பார்க்கிறேன்…",
    visionError: "இப்போது தெளிவாகப் பார்க்க முடியவில்லை. இன்னொரு முறை நிலையாகப் பிடியுங்கள்.",
    sosStart:
      "நான் உங்களுடனேயே இருக்கிறேன். பதற வேண்டாம், உதவி வருகிறது. உங்கள் நேரடி இருப்பிடத்தை எடுக்கிறேன்.",
    sosReady: (where: string) =>
      `உங்கள் அவசர செய்தி தயார். நீங்கள் ${where} அருகில் இருக்கிறீர்கள். பெரிய பச்சை வாட்ஸ்அப் பொத்தானைத் தட்டி நம்பிக்கையானவருக்கு அனுப்புங்கள்.`,
    sosNoLocation:
      "இருப்பிடம் கிடைக்கவில்லை, ஆனால் அவசர செய்தி தயார். பச்சை வாட்ஸ்அப் பொத்தானைத் தட்டுங்கள், அல்லது நூற்று பன்னிரண்டை அழையுங்கள்.",
    describeLocation: (a: AddressParts) => {
      const parts = [a.street, a.area, a.city].filter(Boolean)
      if (parts.length === 0) return `நீங்கள் ${a.display ?? "ஒரு இடம்"} அருகில் இருக்கிறீர்கள். நான் உங்களுடனேயே இருக்கிறேன்.`
      return `நீங்கள் ${parts.join(", ")} பகுதியில் இருக்கிறீர்கள். நிதானமாக இருங்கள், நான் உங்களுடனேயே இருக்கிறேன்.`
    },
    whatsappText: (mapsUrl?: string) =>
      mapsUrl ? `EMERGENCY SOS! My live location: ${mapsUrl}` : "EMERGENCY SOS! Please help me, I need assistance.",
  },
} as const

export type Strings = (typeof STRINGS)[Lang]
