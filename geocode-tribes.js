import fs from 'fs/promises'
import fetch from 'node-fetch'

const MAPBOX_API_KEY = process.env.MAPBOX_API_KEY
if (!MAPBOX_API_KEY) {
    console.error('❌ Missing MAPBOX_API_KEY environment variable.')
    process.exit(1)
}

const inputPath = './public/data/tribal-markers.geojson'
const outputPath = './public/data/tribal-markers-geocoded.geojson'

async function geocode(name) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(name)}.json?access_token=${MAPBOX_API_KEY}&limit=1`
    try {
        const res = await fetch(url)
        const json = await res.json()
        const coords = json?.features?.[0]?.center
        return coords || null
    } catch (err) {
        console.error(`⚠️ Error geocoding "${name}":`, err.message)
        return null
    }
}

async function main() {
    const raw = await fs.readFile(inputPath, 'utf-8')
    const geojson = JSON.parse(raw)

    let updated = 0
    for (const feature of geojson.features) {
        const name = feature.properties.name
        console.log(`🌍 Geocoding: ${name}`)
        const coords = await geocode(name)
        if (coords) {
            feature.geometry.coordinates = coords
            updated++
        } else {
            console.warn(`  ⚠️ No coordinates found for "${name}"`)
        }
    }

    await fs.writeFile(outputPath, JSON.stringify(geojson, null, 2))
    console.log(`✅ Saved ${updated} geocoded features to ${outputPath}`)
}

main()
