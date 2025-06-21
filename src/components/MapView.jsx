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
import TribalPopup from './TribalPopup'
import LayerToggle from './LayerToggle'
import MobileDrawer from './MobileDrawer'
import Legend from './Legend'
import SearchBox from './SearchBox'
import StoryMode from './StoryMode'

import reservationsLayer from '../ol/layers/reservationsLayer'
import ancestralLayer from '../ol/layers/ancestralLayer'

const tribalMarkersUrl = process.env.PUBLIC_URL + '/data/tribal-markers-geocoded.geojson'

export default function MapView() {
  const mapRef = useRef()
  const popupRef = useRef()
  const mapInstance = useRef(null)
  const [mapObj, setMapObj] = useState(null)

  // Layers
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
    source: new VectorSource({ url: tribalMarkersUrl, format: new GeoJSON() }),
    style: new Style({
      image: new CircleStyle({
        radius: 6,
        fill: new Fill({ color: '#ff6600' }),
        stroke: new Stroke({ color: '#fff', width: 2 })
      })
    }),
    visible: true
  })

  // Themed groups (for LayerToggle)
  const [layerGroups, setLayerGroups] = useState({
    Demographics: {
      'AI/AN %': { layer: aiAnLayer, visible: true },
      Poverty: { layer: povertyLayer, visible: true },
      Income: { layer: incomeLayer, visible: true }
    },
    PointsOfInterest: {
      'Tribal Markers': { layer: tribalMarkerLayer, visible: true }
    }
  })

  const [reservationVisible, setReservationVisible] = useState(true)
  const [ancestralVisible, setAncestralVisible] = useState(true)

  // For search dropdown
  const [tribeNames, setTribeNames] = useState([])

  // Fetch tribe names for SearchBox
  useEffect(() => {
    fetch(tribalMarkersUrl)
        .then(res => res.json())
        .then(data => {
          const names = data.features.map(f => f.properties.name)
          setTribeNames(names)
        })
  }, [])

  // Zoom to selected tribe
  function zoomToTribe(tribeName) {
    const source = tribalMarkerLayer.getSource()
    const features = source.getFeatures()
    const match = features.find(f => f.get('name') === tribeName)
    if (match) {
      const coords = match.getGeometry().getCoordinates()
      mapInstance.current.getView().animate({ center: coords, zoom: 6, duration: 600 })
    }
  }

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
    const start = visible ? 0 : 1
    const end = visible ? 1 : 0
    const step = 16 / duration
    let prog = 0
    const iv = setInterval(() => {
      prog += step
      layer.setOpacity(Math.min(Math.max(start + (end - start) * prog, 0), 1))
      if (prog >= 1) clearInterval(iv)
    }, 16)
  }

  function toggleLayerInGroup(groupName, layerName) {
    const updated = { ...layerGroups }
    const target = updated[groupName][layerName]
    const newVis = !target.visible
    fadeLayer(target.layer, newVis)
    target.layer.setVisible(true)
    target.visible = newVis
    setLayerGroups(updated)
  }

  // Cursor change on touch devices
  useEffect(() => {
    const onTouch = () => (document.body.style.cursor = 'pointer')
    window.addEventListener('touchstart', onTouch)
    return () => window.removeEventListener('touchstart', onTouch)
  }, [])

  // Initialize map
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
    setMapObj(map) // 🔑 let StoryMode pick up the map

    // Hover for ancestral lands
    map.on('pointermove', e => {
      let done = false
      map.forEachFeatureAtPixel(e.pixel, (feat, lyr) => {
        if (lyr === ancestralLayer && !done) {
          const nm = feat.get('name') || 'Unnamed Territory'
          popup.setPosition(e.coordinate)
          popupRef.current.innerHTML = `<strong>${nm}</strong>`
          popupRef.current.style.display = 'block'
          done = true
        }
      })
      if (!done) popupRef.current.style.display = 'none'
    })

    // Click popups
    map.on('singleclick', e => {
      let found = false
      map.forEachFeatureAtPixel(e.pixel, (feat, lyr) => {
        if (lyr?.getClassName?.() === 'ai_an' && !found) {
          popup.setPosition(e.coordinate)
          render(<CountyPopup feature={feat} />, popupRef.current)
          popupRef.current.style.display = 'block'
          found = true
        }
        if (lyr === tribalMarkerLayer && !found) {
          popup.setPosition(e.coordinate)
          render(<TribalPopup properties={feat.getProperties()} />, popupRef.current)
          popupRef.current.style.display = 'block'
          found = true
        }
      })
      if (!found) popupRef.current.style.display = 'none'
    })

    // Double-tap zoom
    let lastTap = 0
    map.on('click', e => {
      const now = Date.now()
      const dt = now - lastTap
      if (dt > 0 && dt < 400) {
        const view = map.getView()
        view.animate({ zoom: view.getZoom() + 1, duration: 300 })
      }
      lastTap = now
    })

    return () => map.setTarget(null)
  }, [])

  return (
      <>
        {/* Search */}
        <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1000,
              background: 'white',
              borderRadius: 4
            }}
        >
          <SearchBox tribes={tribeNames} onSelect={zoomToTribe} />
        </div>

        {/* Map Container */}
        <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />

        {/* Popup Container */}
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

        {/* Story Mode Panel */}
        {mapObj && <StoryMode map={mapObj} />}

        {/* Layer Controls & Legend */}
        <MobileDrawer>
          <LayerToggle layerGroups={layerGroups} toggleLayer={toggleLayerInGroup} />
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
