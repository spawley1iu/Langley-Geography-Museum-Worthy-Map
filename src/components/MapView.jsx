import React, { useEffect, useRef, useState } from 'react'
import { Map, View, Overlay } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import OSM from 'ol/source/OSM'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style'
import { render } from 'react-dom'
import 'ol/ol.css'

import CountyPopup from './CountyPopup'
import LayerToggle from './LayerToggle'
import MobileDrawer from './MobileDrawer'
import Legend from './Legend'

// External layers
import reservationsLayer from '../ol/layers/reservationsLayer'
import ancestralLayer from '../ol/layers/ancestralLayer'

// Load tribal markers URL from public assets
const tribalMarkersUrl = process.env.PUBLIC_URL + '/data/tribal-markers-geocoded.geojson'

export default function MapView() {
  const mapRef = useRef()
  const popupRef = useRef()
  const mapInstance = useRef(null) // to persist the map instance across effects

  const aiAnLayer = new VectorLayer({
    source: new VectorSource({ url: '/data/counties.geojson', format: new GeoJSON() }),
    className: 'ai_an',
    visible: true
  })

  const povertyLayer = new VectorLayer({
    source: new VectorSource({ url: '/data/counties.geojson', format: new GeoJSON() }),
    visible: true
  })

  const incomeLayer = new VectorLayer({
    source: new VectorSource({ url: '/data/counties.geojson', format: new GeoJSON() }),
    visible: true
  })

  const tribalMarkerLayer = new VectorLayer({
    source: new VectorSource({
      url: tribalMarkersUrl,
      format: new GeoJSON()
    }),
    style: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: '#ff6600' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      })
    }),
    visible: true
  })

  const [layerState, setLayerState] = useState({
    'AI/AN %': { layer: aiAnLayer, visible: true },
    'Poverty': { layer: povertyLayer, visible: true },
    'Income': { layer: incomeLayer, visible: true }
  })

  const [reservationVisible, setReservationVisible] = useState(true)
  const [ancestralVisible, setAncestralVisible] = useState(true)

  function toggleReservation() {
    reservationsLayer.setVisible(!reservationVisible)
    setReservationVisible(!reservationVisible)
  }

  function toggleAncestral() {
    ancestralLayer.setVisible(!ancestralVisible)
    setAncestralVisible(!ancestralVisible)
  }

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
    const layerObj = updated[key]
    const newVisible = !layerObj.visible

    fadeLayer(layerObj.layer, newVisible)
    layerObj.layer.setVisible(true)
    layerObj.visible = newVisible
    setLayerState(updated)
  }

  // TOUCH + DOUBLE TAP
  useEffect(() => {
    const handleTouch = () => {
      document.body.style.cursor = 'pointer'
    }
    window.addEventListener('touchstart', handleTouch)
    return () => window.removeEventListener('touchstart', handleTouch)
  }, [])

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
        ancestralLayer,
        tribalMarkerLayer
      ],
      overlays: [popup],
      view: new View({
        center: [-10500000, 5000000],
        zoom: 4
      })
    })

    mapInstance.current = map

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

    // DOUBLE TAP DETECTION
    let lastTap = 0
    map.on('click', e => {
      const now = new Date().getTime()
      const timeSince = now - lastTap

      if (timeSince < 400 && timeSince > 0) {
        const view = map.getView()
        view.animate({ zoom: view.getZoom() + 1, duration: 300 })
      } else {
        console.log('Single tap at:', e.coordinate)
      }

      lastTap = now
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
          <Legend
              toggleReservation={toggleReservation}
              toggleAncestral={toggleAncestral}
              reservationVisible={reservationVisible}
              ancestralVisible={ancestralVisible}
          />
        </MobileDrawer>
      </>
  )
}
