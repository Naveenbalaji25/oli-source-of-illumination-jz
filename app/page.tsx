import { OliApp } from "@/components/oli/oli-app"

export const dynamic = "force-dynamic"

export default function Page() {
  const offline = !process.env.GEMINI_API_KEY?.trim()
  return <OliApp offline={offline} />
}
