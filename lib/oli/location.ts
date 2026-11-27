import type { AddressParts, Lang } from "./i18n"

export interface LiveLocation {
  lat: number
  lon: number
  accuracy: number
  mapsUrl: string
  address: AddressParts
}

export function getPosition(): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation unavailable"))
      return
    }
    navigator.geolocation.getCurrentPosition(resolve, reject, {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 10000,
    })
  })
}

interface NominatimResponse {
  display_name?: string
  address?: Record<string, string>
}

export async function reverseGeocode(lat: number, lon: number, lang: Lang): Promise<AddressParts> {
  const url = new URL("https://nominatim.openstreetmap.org/reverse")
  url.searchParams.set("format", "jsonv2")
  url.searchParams.set("lat", lat.toFixed(6))
  url.searchParams.set("lon", lon.toFixed(6))
  url.searchParams.set("zoom", "18")
  url.searchParams.set("addressdetails", "1")
  url.searchParams.set("accept-language", lang)

  try {
    const res = await fetch(url.toString(), { signal: AbortSignal.timeout(9000) })
    if (!res.ok) throw new Error(`Nominatim ${res.status}`)
    const data = (await res.json()) as NominatimResponse
    const a = data.address ?? {}
    return {
      street: a.road ?? a.pedestrian ?? a.footway ?? a.street,
      area: a.neighbourhood ?? a.suburb ?? a.quarter ?? a.city_district,
      city: a.city ?? a.town ?? a.village ?? a.county ?? a.state_district,
      display: data.display_name?.split(",").slice(0, 3).join(","),
    }
  } catch {
    return { display: `${lat.toFixed(4)}, ${lon.toFixed(4)}` }
  }
}

export async function getLiveLocation(lang: Lang): Promise<LiveLocation> {
  const pos = await getPosition()
  const { latitude: lat, longitude: lon, accuracy } = pos.coords
  const address = await reverseGeocode(lat, lon, lang)
  return {
    lat,
    lon,
    accuracy,
    mapsUrl: `https://www.google.com/maps?q=${lat.toFixed(6)},${lon.toFixed(6)}`,
    address,
  }
}

export function shortPlace(address: AddressParts): string {
  return [address.street, address.area, address.city].filter(Boolean).join(", ") || address.display || ""
}
