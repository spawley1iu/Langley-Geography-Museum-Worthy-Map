// geocode-res.js
/**
 * Usage: node geocode-res.js
 * Outputs src/data/reservations-geocoded.geojson
 * Uses free Nominatim API (1 request/sec)
 */

import fs from 'fs/promises'
import fetch from 'node-fetch'

async function geocode(name) {
  const url = new URL('https://nominatim.openstreetmap.org/search')
  url.searchParams.set('q', `${name}, United States`)
  url.searchParams.set('format', 'json')
  url.searchParams.set('limit', '1')
  const res = await fetch(url, { headers: { 'User-Agent': 'LangleyMap/1.0 (your-email@example.com)' } })
  const arr = await res.json()
  if (arr.length > 0) {
    return [+arr[0].lon, +arr[0].lat]
  }
  console.warn(`⚠️ No geocode for "${name}"`)
  return [0, 0]
}

async function main() {
  const text = await fs.readFile('src/data/reservations.geojson', 'utf8')
  const gj = JSON.parse(text)
  for (const feat of gj.features) {
    const name = feat.properties.name
    console.log(`Geocoding: ${name}`)
    const [lon, lat] = await geocode(name)
    feat.geometry.coordinates = [lon, lat]
    await new Promise(r => setTimeout(r, 1100)) // throttle
  }
  await fs.writeFile('src/data/reservations-geocoded.geojson', JSON.stringify(gj, null, 2))
  console.log('✅ Done — saved to reservations-geocoded.geojson')
}

main().catch(console.error)
