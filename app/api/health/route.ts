export const dynamic = "force-dynamic"

export function GET() {
  return Response.json({
    ok: true,
    service: "oli-illumination",
    offline: !process.env.GEMINI_API_KEY?.trim(),
  })
}
