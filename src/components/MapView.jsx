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

  // keep map in state so StoryMode can see it
  const [mapObj, setMapObj] = useState(null)
  // highlightSource for StoryMode to draw glowing halos
  const [highlightSource, setHighlightSource] = useState(null)

  // --- define your core layers ---
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

  // groups for your LayerToggle drawer
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

  // for SearchBox
  const [tribeNames, setTribeNames] = useState([])

  // fetch names for dropdown
  useEffect(() => {
    fetch(tribalMarkersUrl)
        .then(res => res.json())
        .then(data => setTribeNames(data.features.map(f => f.properties.name)))
  }, [])

  // search → zoom
  function zoomToTribe(name) {
    const features = tribalMarkerLayer.getSource().getFeatures()
    const f = features.find(f => f.get('name') === name)
    if (f) {
      const coords = f.getGeometry().getCoordinates()
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

  function toggleLayerInGroup(group, name) {
    const updated = { ...layerGroups }
    const target = updated[group][name]
    const nv = !target.visible
    fadeLayer(target.layer, nv)
    target.layer.setVisible(true)
    target.visible = nv
    setLayerGroups(updated)
  }

  // change cursor on touch devices
  useEffect(() => {
    const onTouch = () => (document.body.style.cursor = 'pointer')
    window.addEventListener('touchstart', onTouch)
    return () => window.removeEventListener('touchstart', onTouch)
  }, [])

  // --- initialize map + popups + highlight layer ---
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

    // create & add highlight layer
    const hlSource = new VectorSource()
    const hlLayer = new VectorLayer({
      source: hlSource,
      style: new Style({
        image: new CircleStyle({
          radius: 14,
          fill: null,
          stroke: new Stroke({ color: 'yellow', width: 4 })
        })
      })
    })
    map.addLayer(hlLayer)
    setHighlightSource(hlSource)

    // keep refs & state
    mapInstance.current = map
    setMapObj(map)

    // hover for ancestral lands
    map.on('pointermove', e => {
      let done = false
      map.forEachFeatureAtPixel(e.pixel, (f, lyr) => {
        if (lyr === ancestralLayer && !done) {
          const nm = f.get('name') || 'Unnamed Territory'
          popup.setPosition(e.coordinate)
          popupRef.current.innerHTML = `<strong>${nm}</strong>`
          popupRef.current.style.display = 'block'
          done = true
        }
      })
      if (!done) popupRef.current.style.display = 'none'
    })

    // click for popups
    map.on('singleclick', e => {
      let found = false
      map.forEachFeatureAtPixel(e.pixel, (f, lyr) => {
        if (lyr?.getClassName?.() === 'ai_an' && !found) {
          popup.setPosition(e.coordinate)
          render(<CountyPopup feature={f} />, popupRef.current)
          popupRef.current.style.display = 'block'
          found = true
        }
        if (lyr === tribalMarkerLayer && !found) {
          popup.setPosition(e.coordinate)
          render(<TribalPopup properties={f.getProperties()} />, popupRef.current)
          popupRef.current.style.display = 'block'
          found = true
        }
      })
      if (!found) popupRef.current.style.display = 'none'
    })

    // double-tap zoom
    let lastTap = 0
    map.on('click', e => {
      const now = Date.now()
      if (now - lastTap < 400) {
        map.getView().animate({ zoom: map.getView().getZoom() + 1, duration: 300 })
      }
      lastTap = now
    })

    return () => map.setTarget(null)
  }, [])

  return (
      <>
        {/* search dropdown */}
        <div style={{
          position: 'absolute', top: 10, left: 10,
          zIndex: 1000, background: 'white', borderRadius: 4
        }}>
          <SearchBox tribes={tribeNames} onSelect={zoomToTribe} />
        </div>

        {/* map */}
        <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />

        {/* popup container */}
        <div
            ref={popupRef}
            className="ol-popup"
            style={{
              position: 'absolute', display: 'none', zIndex: 999,
              background: 'white', padding: 10, borderRadius: 6,
              boxShadow: '0 2px 6px rgba(0,0,0,0.3)'
            }}
        />

        {/* story mode panel */}
        {mapObj && highlightSource && (
            <StoryMode
                map={mapObj}
                highlightSource={highlightSource}
            />
        )}

        {/* layer toggles & legend */}
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
