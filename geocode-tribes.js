import fs from 'fs/promises';
import fetch from 'node-fetch';
import dotenv from 'dotenv';
dotenv.config();

const INPUT = './public/data/tribal-markers.geojson';
const OUTPUT = './public/data/tribal-markers-geocoded.geojson';
const ACCESS = process.env.MAPBOX_API_KEY;
const BATCH_SIZE = 50;
const DELAY_MS = 200;

async function delay(ms) {
    return new Promise((res) => setTimeout(res, ms));
}

async function geocodeName(name) {
    const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(name)}.json?limit=1&access_token=${ACCESS}`;
    try {
        const res = await fetch(url);
        const json = await res.json();
        const f = json.features?.[0];
        if (f && f.center) return f.center;
        console.warn(`No match: ${name}`);
        return [0, 0];
    } catch (err) {
        console.error(`Error for ${name}:`, err);
        return [0, 0];
    }
}

async function main() {
    const raw = await fs.readFile(INPUT, 'utf-8');
    const geo = JSON.parse(raw);
    for (let i = 0; i < geo.features.length; i += BATCH_SIZE) {
        const batch = geo.features.slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async (feat) => {
            const name = feat.properties.name;
            const [lon, lat] = await geocodeName(name);
            feat.geometry.coordinates = [lon, lat];
        }));
        console.log(`Processed features ${i + 1}-${Math.min(i + BATCH_SIZE, geo.features.length)}`);
        await delay(DELAY_MS);
    }
    await fs.writeFile(OUTPUT, JSON.stringify(geo, null, 2));
    console.log('✅ Geocoding complete:', OUTPUT);
}

main();
