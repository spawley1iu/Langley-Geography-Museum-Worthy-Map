// fetch-ancestral.js

import fs from 'fs/promises'
import fetch from 'node-fetch'

// Read Native Land API key from environment variable
const apiKey = process.env.NATIVE_API_KEY

if (!apiKey) {
    console.error('❌ Error: NATIVE_API_KEY environment variable not set.')
    process.exit(1)
}

// Construct the API endpoint
const url = `https://native-land.ca/api/polygons/geojson/territories?key=${apiKey}`

/**
 * Fetches ancestral territories GeoJSON and saves it to local file.
 */
async function fetchAndSave() {
    try {
        console.log('🌐 Fetching Native Land Digital data...')
        const res = await fetch(url)

        if (!res.ok) {
            throw new Error(`Failed request: ${res.status} ${res.statusText}`)
        }

        const data = await res.json()
        await fs.writeFile('./public/data/native-lands.geojson', JSON.stringify(data, null, 2))
        console.log('✅ Saved to public/data/native-lands.geojson')
    } catch (err) {
        console.error('❌ Error during fetch/save:', err.message)
        process.exit(1)
    }
}

fetchAndSave()
