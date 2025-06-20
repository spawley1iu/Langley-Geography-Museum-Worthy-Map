import { Vector as VectorLayer } from 'ol/layer'
import { Fill, Stroke, Style, Text } from 'ol/style'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'

const ancestralLayer = new VectorLayer({
    source: new VectorSource({
        url: '/data/native-lands.geojson',
        format: new GeoJSON(),
    }),
    style: feature => {
        const name = feature.get('name') || 'Unnamed'
        return new Style({
            fill: new Fill({ color: 'rgba(0,137,123,0.15)' }),
            stroke: new Stroke({ color: '#00897b', width: 2 }),
            text: new Text({
                text: name,
                font: '12px sans-serif',
                fill: new Fill({ color: '#004d40' }),
                stroke: new Stroke({ color: '#fff', width: 3 }),
                overflow: true
            })
        })
    },
    visible: true,
    className: 'ancestral-layer'
})

export default ancestralLayer
