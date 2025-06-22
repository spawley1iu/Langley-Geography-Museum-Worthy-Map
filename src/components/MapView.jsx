// src/components/MapView.jsx
import React, { useEffect, useRef, useState } from 'react'
import { Map, View, Overlay } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import OSM from 'ol/source/OSM'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style'
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

  // hold map object for StoryMode
  const [mapObj, setMapObj] = useState(null)
  // hold highlight source for StoryMode
  const [highlightSource, setHighlightSource] = useState(null)
  // for the search dropdown
  const [tribeNames, setTribeNames] = useState([])

  // Base county/AIAN layers
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

  // Tribal markers layer
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

  // groupings for LayerToggle
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

  // fetch for search dropdown
  useEffect(() => {
    fetch(tribalMarkersUrl)
        .then(res => res.json())
        .then(data => {
          setTribeNames(data.features.map(f => f.properties.name))
        })
  }, [])

  // search box zoom
  function zoomToTribe(name) {
    const src = tribalMarkerLayer.getSource()
    const feat = src.getFeatures().find(f => f.get('name') === name)
    if (feat) {
      const coords = feat.getGeometry().getCoordinates()
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

  // simple fade
  function fadeLayer(layer, visible) {
    const duration = 600
    const start = visible ? 0 : 1
    const end = visible ? 1 : 0
    const step = 16 / duration
    let t = 0
    const iv = setInterval(() => {
      t += step
      layer.setOpacity(Math.min(Math.max(start + (end - start) * t, 0), 1))
      if (t >= 1) clearInterval(iv)
    }, 16)
  }

  function toggleLayerInGroup(group, name) {
    const copy = { ...layerGroups }
    const target = copy[group][name]
    const vis = !target.visible
    fadeLayer(target.layer, vis)
    target.layer.setVisible(true)
    target.visible = vis
    setLayerGroups(copy)
  }

  // change cursor on touch devices
  useEffect(() => {
    const onTouch = () => (document.body.style.cursor = 'pointer')
    window.addEventListener('touchstart', onTouch)
    return () => window.removeEventListener('touchstart', onTouch)
  }, [])

  // map init
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

    // highlight layer
    const hs = new VectorSource()
    const hl = new VectorLayer({
      source: hs,
      style: new Style({
        image: new CircleStyle({
          radius: 14,
          fill: null,
          stroke: new Stroke({ color: 'yellow', width: 4 })
        })
      })
    })
    map.addLayer(hl)
    setHighlightSource(hs)

    mapInstance.current = map
    setMapObj(map)

    // hover ancestral
    map.on('pointermove', e => {
      let done = false
      map.forEachFeatureAtPixel(e.pixel, (f, l) => {
        if (l === ancestralLayer && !done) {
          const n = f.get('name') || 'Unnamed'
          popup.setPosition(e.coordinate)
          popupRef.current.innerHTML = `<strong>${n}</strong>`
          popupRef.current.style.display = 'block'
          done = true
        }
      })
      if (!done) popupRef.current.style.display = 'none'
    })

    // click for popups
    map.on('singleclick', e => {
      let found = false
      map.forEachFeatureAtPixel(e.pixel, (f, l) => {
        if (l?.getClassName?.() === 'ai_an' && !found) {
          popup.setPosition(e.coordinate)
          render(<CountyPopup feature={f} />, popupRef.current)
          popupRef.current.style.display = 'block'
          found = true
        }
        if (l === tribalMarkerLayer && !found) {
          popup.setPosition(e.coordinate)
          render(<TribalPopup properties={f.getProperties()} />, popupRef.current)
          popupRef.current.style.display = 'block'
          found = true
        }
      })
      if (!found) popupRef.current.style.display = 'none'
    })

    // double-tap zoom
    let last = 0
    map.on('click', e => {
      const now = Date.now()
      if (now - last < 400) {
        const v = map.getView()
        v.animate({ zoom: v.getZoom() + 1, duration: 300 })
      }
      last = now
    })

    return () => map.setTarget(null)
  }, [])

  return (
      <>
        {/* Search box */}
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', borderRadius: 4 }}>
          <SearchBox tribes={tribeNames} onSelect={zoomToTribe} />
        </div>

        {/* Map */}
        <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />

        {/* Popup */}
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

        {/* Story Mode */}
        {mapObj && highlightSource && (
            <StoryMode map={mapObj} highlightSource={highlightSource} />
        )}

        {/* Drawer & Legend */}
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
