import React, { useEffect, useRef, useState } from 'react'
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
import LayerToggle from './LayerToggle'
import MobileDrawer from './MobileDrawer'
import reservationsLayer from '../ol/layers/reservationsLayer'
import ancestralLayer from '../ol/layers/ancestralLayer'

export default function MapView() {
  const mapRef = useRef()
  const popupRef = useRef()

  // === Choropleth Layers ===
  const aiAnLayer = new VectorLayer({
    source: new VectorSource({ url: '/data/counties.geojson', format: new GeoJSON() }),
    style: new Style({ fill: new Fill({ color: 'rgba(180, 60, 60, 0.6)' }), stroke: new Stroke({ color: '#333', width: 0.5 }) }),
    className: 'ai_an',
    visible: true,
    opacity: 1
  })

  const povertyLayer = new VectorLayer({
    source: new VectorSource({ url: '/data/counties.geojson', format: new GeoJSON() }),
    style: new Style({ fill: new Fill({ color: 'rgba(60, 60, 180, 0.6)' }), stroke: new Stroke({ color: '#333', width: 0.5 }) }),
    visible: true,
    opacity: 1
  })

  const incomeLayer = new VectorLayer({
    source: new VectorSource({ url: '/data/counties.geojson', format: new GeoJSON() }),
    style: new Style({ fill: new Fill({ color: 'rgba(60, 180, 60, 0.6)' }), stroke: new Stroke({ color: '#333', width: 0.5 }) }),
    visible: true,
    opacity: 1
  })

  const [layerState, setLayerState] = useState({
    'AI/AN %': { layer: aiAnLayer, visible: true },
    'Poverty': { layer: povertyLayer, visible: true },
    'Income': { layer: incomeLayer, visible: true }
  })

  function fadeLayer(layer, visible) {
    const duration = 600
    const startOpacity = visible ? 0 : 1
    const endOpacity = visible ? 1 : 0
    const step = 16 / duration
    let progress = 0

    const interval = setInterval(() => {
      progress += step
      const opacity = startOpacity + (endOpacity - startOpacity) * progress
      layer.setOpacity(Math.min(Math.max(opacity, 0), 1))
      if (progress >= 1) clearInterval(interval)
    }, 16)
  }

  function toggleLayer(key) {
    const updated = { ...layerState }
    const current = updated[key]
    const newVisible = !current.visible

    fadeLayer(current.layer, newVisible)
    current.layer.setVisible(true) // remain visible to allow fading
    updated[key].visible = newVisible
    setLayerState(updated)
  }

  useEffect(() => {
    const popup = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -12]
    })

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        aiAnLayer,
        povertyLayer,
        incomeLayer,
        reservationsLayer,
        ancestralLayer
      ],
      overlays: [popup],
      view: new View({
        center: [-10500000, 5000000],
        zoom: 4
      })
    })

    // Tribal hover tooltip
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

    // County data popup
    map.on('singleclick', e => {
      let found = false
      map.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
        if (layer?.getClassName?.() === 'ai_an' && !found) {
          popup.setPosition(e.coordinate)
          render(<CountyPopup feature={feature} />, popupRef.current)
          popupRef.current.style.display = 'block'
          found = true
        }
      })
      if (!found) popupRef.current.style.display = 'none'
    })

    return () => map.setTarget(null)
  }, [])

  return (
      <>
        <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />
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
        <MobileDrawer>
          <LayerToggle layers={layerState} toggleLayer={toggleLayer} />
        </MobileDrawer>
      </>
  )
}
