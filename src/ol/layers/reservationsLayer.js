import { Vector as VectorLayer } from 'ol/layer'
import { Stroke, Style } from 'ol/style'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'

const reservationsLayer = new VectorLayer({
    source: new VectorSource({
        url: '/data/reservations-geocoded.geojson',
        format: new GeoJSON(),
    }),
    style: new Style({
        stroke: new Stroke({
            color: '#d32f2f',
            width: 3,
        }),
    }),
    visible: true,
    className: 'reservations-layer',
})

export default reservationsLayer
