import React, { useEffect, useRef } from 'react'
import 'ol/ol.css'
import Map from 'ol/Map'
import View from 'ol/View'
import GeoJSON from 'ol/format/GeoJSON'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { OSM } from 'ol/source'
import VectorSource from 'ol/source/Vector'
import { Style, Stroke, Fill } from 'ol/style'
import Overlay from 'ol/Overlay'
import Legend from './Legend'

const choroplethStyles = {
  ai_an: new Style({ fill: new Fill({ color: 'rgba(180, 60, 60, 0.6)' }), stroke: new Stroke({ color: '#333', width: 0.5 }) }),
  poverty: new Style({ fill: new Fill({ color: 'rgba(60, 60, 180, 0.6)' }), stroke: new Stroke({ color: '#333', width: 0.5 }) }),
  income: new Style({ fill: new Fill({ color: 'rgba(60, 180, 60, 0.6)' }), stroke: new Stroke({ color: '#333', width: 0.5 }) }),
}

export default function MapView() {
  const mapRef = useRef()
  const popupRef = useRef()

  useEffect(() => {
    const base = new TileLayer({ source: new OSM() })

    const counties = new VectorLayer({
      source: new VectorSource({ url: '/data/counties.geojson', format: new GeoJSON() }),
      style: choroplethStyles.ai_an,
      className: 'fade-layer ai_an',
    })

    const reservations = new VectorLayer({
      source: new VectorSource({ url: '/data/reservations.geojson', format: new GeoJSON() }),
      style: new Style({
        stroke: new Stroke({ color: '#000', width: 2 }),
        fill: new Fill({ color: 'rgba(255, 0, 0, 0.1)' }),
      }),
    })

    const ancestralLayer = new VectorLayer({
      source: new VectorSource({ url: '/data/native-lands.geojson', format: new GeoJSON() }),
      style: new Style({
        stroke: new Stroke({ color: '#f0b000', width: 1 }),
        fill: new Fill({ color: 'rgba(240, 176, 0, 0.1)' }),
      }),
    })

    const popup = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
    })

    const map = new Map({
      target: mapRef.current,
      layers: [base, counties, reservations, ancestralLayer],
      view: new View({ center: [-12900000, 5350000], zoom: 5 }),
      overlays: [popup],
    })

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

    // For toggling between layers
    const setLayerVisibility = metric => {
      for (const key in choroplethStyles) {
        const isVisible = key === metric
        counties.setStyle(isVisible ? choroplethStyles[key] : null)
        counties.getClassName() === key
            ? counties.getSource().refresh()
            : null
      }
    }

    window.setLayerMetric = setLayerVisibility // exposed for Legend interaction

    return () => map.setTarget(null)
  }, [])

  return (
      <>
        <div ref={mapRef} style={{ width: '100%', height: '100%' }} />
        <div ref={popupRef} className="ol-popup" style={{ display: 'none' }}></div>
        <Legend />
      </>
  )
}
