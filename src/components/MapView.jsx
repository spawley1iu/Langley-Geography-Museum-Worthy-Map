import React, { useEffect, useRef } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { OSM } from 'ol/source'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Stroke, Fill } from 'ol/style'
import Overlay from 'ol/Overlay'
import 'ol/ol.css'
import reservationData from './data/reservations-geocoded.geojson?url'

const MapView = () => {
  const mapRef = useRef()
  const popupRef = useRef()

  useEffect(() => {
    const popup = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10]
    })

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
      ],
      view: new View({
        center: [-10700000, 4600000],
        zoom: 4
      }),
      overlays: [popup]
    })

    // Reservation Layer
    fetch(reservationData)
        .then(res => res.json())
        .then(geojson => {
          const reservationLayer = new VectorLayer({
            source: new VectorSource({
              features: new GeoJSON().readFeatures(geojson, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
              })
            }),
            style: new Style({
              stroke: new Stroke({
                color: '#d32f2f',
                width: 2
              }),
              fill: new Fill({
                color: 'rgba(211, 47, 47, 0.1)'
              })
            })
          })

          map.addLayer(reservationLayer)

          map.on('pointermove', (e) => {
            const feature = map.forEachFeatureAtPixel(e.pixel, f => f)
            if (feature && feature.get('name')) {
              const coordinates = e.coordinate
              popup.setPosition(coordinates)
              popupRef.current.innerHTML = `<strong>${feature.get('name')}</strong>`
              popupRef.current.style.display = 'block'
            } else {
              popupRef.current.style.display = 'none'
            }
          })
        })

    return () => map.setTarget(null)
  }, [])

  return (
      <>
        <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />
        <div ref={popupRef} className="ol-popup" style={{
          background: '#fff',
          padding: '6px 10px',
          borderRadius: '4px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
          display: 'none',
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          fontSize: '0.9rem',
          fontWeight: '500',
          pointerEvents: 'none'
        }} />
      </>
  )
}

expo
