import React, { useEffect, useRef } from 'react'
import { render } from 'react-dom'
import 'ol/ol.css'
import { Map, View, Overlay } from 'ol'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import GeoJSON from 'ol/format/GeoJSON'
import OSM from 'ol/source/OSM'
import { Style, Fill, Stroke } from 'ol/style'

import CountyPopup from './CountyPopup'
import reservationsLayer from '../ol/layers/reservationsLayer'
import ancestralLayer from '../ol/layers/ancestralLayer'

const choroplethStyles = {
  ai_an: new Style({ fill: new Fill({ color: 'rgba(180, 60, 60, 0.6)' }), stroke: new Stroke({ color: '#333', width: 0.5 }) }),
  poverty: new Style({ fill: new Fill({ color: 'rgba(60, 60, 180, 0.6)' }), stroke: new Stroke({ color: '#333', width: 0.5 }) }),
  income: new Style({ fill: new Fill({ color: 'rgba(60, 180, 60, 0.6)' }), stroke: new Stroke({ color: '#333', width: 0.5 }) })
}

export default function MapView() {
  const mapRef = useRef()
  const popupRef = useRef()

  useEffect(() => {
    const base = new TileLayer({ source: new OSM() })

    const counties = new VectorLayer({
      source: new VectorSource({
        url: '/data/counties.geojson',
        format: new GeoJSON()
      }),
      style: choroplethStyles.ai_an,
      className: 'ai_an'
    })

    const popup = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -12]
    })

    const map = new Map({
      target: mapRef.current,
      layers: [base, counties, reservationsLayer, ancestralLayer],
      view: new View({
        center: [-10500000, 5000000],
        zoom: 4
      }),
      overlays: [popup]
    })

    // Ancestral land hover tooltip
    map.on('pointermove', e => {
      let hoverDone = false
      map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
        if (layer === ancestralLayer && !hoverDone) {
          const name = feature.get('name') || 'Unnamed Territory'
          popup.setPosition(e.coordinate)
          popupRef.current.innerHTML = `<strong>${name}</strong>`
          popupRef.current.style.display = 'block'
          hoverDone = true
        }
      })
      if (!hoverDone) popupRef.current.style.display = 'none'
    })

    // County click popup
    map.on('singleclick', (e) => {
      let found = false
      map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
        if (layer?.getClassName?.() === 'ai_an' && !found) {
          popup.setPosition(e.coordinate)
          render(<CountyPopup feature={feature} />, popupRef.current)
          popupRef.current.style.display = 'block'
          found = true
        }
      })
      if (!found) {
        popupRef.current.style.display = 'none'
      }
    })

    return () => map.setTarget(null)
  }, [])

  return (
      <>
        <div ref={mapRef} style={{ height: '100vh', width: '100vw' }} />
        <div
            ref={popupRef}
            className="ol-popup"
            style={{
              position: 'absolute',
              display: 'none',
              zIndex: 999,
              background: 'white',
              padding: 10,
              borderRadius: 6,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}
        />
      </>
  )
}
