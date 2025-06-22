// src/components/MapView.jsx
import React, { useEffect, useRef, useState } from 'react'
import { Map, View, Overlay } from 'ol'
import TileLayer from 'ol/layer/Tile'
import { Vector as VectorLayer } from 'ol/layer'
import { Vector as VectorSource } from 'ol/source'
import OSM from 'ol/source/OSM'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style'
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
  const [highlightSource, setHighlightSource] = useState(null)

  // --- VECTOR LAYERS --------------------------------------------------------

  // counties (AI/AN %)
  const aiAnLayer = new VectorLayer({
    source: new VectorSource({
      url: '/data/counties.geojson',
      format: new GeoJSON()
    }),
    className: 'ai_an',
    visible: true
  })

  // poverty & income (same geojson, different styling not shown here)
  const povertyLayer = new VectorLayer({
    source: new VectorSource({ url: '/data/counties.geojson', format: new GeoJSON() }),
    visible: true
  })
  const incomeLayer = new VectorLayer({
    source: new VectorSource({ url: '/data/counties.geojson', format: new GeoJSON() }),
    visible: true
  })

  // tribal markers, with always-on text label
  const tribalMarkerLayer = new VectorLayer({
    source: new VectorSource({ url: tribalMarkersUrl, format: new GeoJSON() }),
    style: feature => {
      const tribe = feature.get('tribeName') || 'Unknown'
      return new Style({
        image: new CircleStyle({
          radius: 6,
          fill: new Fill({ color: '#ff6600' }),
          stroke: new Stroke({ color: '#fff', width: 2 })
        }),
        text: new Text({
          text: tribe,
          font: '12px sans-serif',
          fill: new Fill({ color: '#222' }),
          stroke: new Stroke({ color: '#fff', width: 3 }),
          offsetY: -12
        })
      })
    },
    visible: true
  })

  // groupings for the layer toggle drawer
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

  // for search dropdown
  const [tribeNames, setTribeNames] = useState([])

  // fetch list of tribeName values
  useEffect(() => {
    fetch(tribalMarkersUrl)
        .then(r => r.json())
        .then(json => {
          const names = json.features.map(f => f.properties.tribeName)
          setTribeNames(names)
        })
  }, [])

  // zoom to a chosen tribe
  function zoomToTribe(tribeName) {
    const feat = tribalMarkerLayer
        .getSource()
        .getFeatures()
        .find(f => f.get('tribeName') === tribeName)
    if (!feat) return
    const coords = feat.getGeometry().getCoordinates()
    mapInstance.current.getView().animate({ center: coords, zoom: 6, duration: 600 })
  }

  // toggle reservations / ancestral layer
  function toggleReservation() {
    reservationsLayer.setVisible(!reservationVisible)
    setReservationVisible(!reservationVisible)
  }
  function toggleAncestral() {
    ancestralLayer.setVisible(!ancestralVisible)
    setAncestralVisible(!ancestralVisible)
  }

  // fade helper
  function fadeLayer(layer, targetVisible) {
    const duration = 600,
        step = 16 / duration
    let progress = 0,
        start = targetVisible ? 0 : 1,
        end = targetVisible ? 1 : 0
    const iv = setInterval(() => {
      progress += step
      layer.setOpacity(Math.min(Math.max(start + (end - start) * progress, 0), 1))
      if (progress >= 1) clearInterval(iv)
    }, 16)
  }

  function toggleLayerInGroup(group, name) {
    const copy = { ...layerGroups }
    const item = copy[group][name]
    const nv = !item.visible
    fadeLayer(item.layer, nv)
    item.layer.setVisible(true)
    item.visible = nv
    setLayerGroups(copy)
  }

  // change cursor on touch
  useEffect(() => {
    const onTouch = () => (document.body.style.cursor = 'pointer')
    window.addEventListener('touchstart', onTouch)
    return () => window.removeEventListener('touchstart', onTouch)
  }, [])

  // --- INITIALIZE MAP -------------------------------------------------------

  useEffect(() => {
    const popup = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -12]
    })

    const map = new Map({
      target: mapRef.current,
      view: new View({ center: [-10500000, 5000000], zoom: 4 }),
      layers: [
        new TileLayer({ source: new OSM() }),
        aiAnLayer,
        povertyLayer,
        incomeLayer,
        reservationsLayer,
        ancestralLayer,
        tribalMarkerLayer
      ],
      overlays: [popup]
    })

    // add a highlight layer for StoryMode
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

    mapInstance.current = map
    setMapObj(map)
    setHighlightSource(hlSource)

    // hover tooltip for ancestral lands
    map.on('pointermove', e => {
      let done = false
      map.forEachFeatureAtPixel(e.pixel, (f, lyr) => {
        if (lyr === ancestralLayer && !done) {
          const label = f.get('name') || 'Unnamed Territory'
          popup.setPosition(e.coordinate)
          popupRef.current.innerHTML = `<strong>${label}</strong>`
          popupRef.current.style.display = 'block'
          done = true
        }
      })
      if (!done) popupRef.current.style.display = 'none'
    })

    // click popup for counties & tribes
    map.on('singleclick', e => {
      let found = false
      map.forEachFeatureAtPixel(e.pixel, (f, lyr) => {
        if (lyr.getClassName?.() === 'ai_an' && !found) {
          popup.setPosition(e.coordinate)
          render(<CountyPopup feature={f} />, popupRef.current)
          popupRef.current.style.display = 'block'
          found = true
        }
        if (lyr === tribalMarkerLayer && !found) {
          const tribe = f.get('tribeName') || 'Unknown'
          popup.setPosition(e.coordinate)
          render(<TribalPopup name={tribe} properties={f.getProperties()} />, popupRef.current)
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

  // --- RENDER ----------------------------------------------------------------

  return (
      <>
        <div
            style={{
              position: 'absolute',
              top: 10,
              left: 10,
              zIndex: 1000,
              background: '#fff',
              borderRadius: 4,
              padding: 6
            }}
        >
          <SearchBox tribes={tribeNames} onSelect={zoomToTribe} />
        </div>

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

        {mapObj && highlightSource && (
            <StoryMode map={mapObj} highlightSource={highlightSource} />
        )}

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
