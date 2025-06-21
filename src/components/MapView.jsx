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

import reservationsLayer from '../ol/layers/reservationsLayer'
import ancestralLayer from '../ol/layers/ancestralLayer'

const tribalMarkersUrl = process.env.PUBLIC_URL + '/data/tribal-markers-geocoded.geojson'

export default function MapView() {
  const mapRef = useRef()
  const popupRef = useRef()
  const mapInstance = useRef(null)

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

  const thematicGroups = {
    Demographics: ['AI/AN %', 'Poverty', 'Income'],
    Geography: ['Reservations', 'Ancestral Lands'],
    PointsOfInterest: ['Tribal Markers']
  }

  const [layerGroups, setLayerGroups] = useState({
    Demographics: {
      'AI/AN %': { layer: aiAnLayer, visible: true },
      'Poverty': { layer: povertyLayer, visible: true },
      'Income': { layer: incomeLayer, visible: true }
    },
    PointsOfInterest: {
      'Tribal Markers': { layer: tribalMarkerLayer, visible: true }
    }
  })

  const [reservationVisible, setReservationVisible] = useState(true)
  const [ancestralVisible, setAncestralVisible] = useState(true)

  const [tribeNames, setTribeNames] = useState([])

  useEffect(() => {
    fetch(tribalMarkersUrl)
        .then(res => res.json())
        .then(data => {
          const names = data.features.map(f => f.properties.name)
          setTribeNames(names)
        })
  }, [])

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

  function toggleLayerInGroup(groupName, layerName) {
    const updated = { ...layerGroups }
    const target = updated[groupName][layerName]
    const newVisible = !target.visible

    fadeLayer(target.layer, newVisible)
    target.layer.setVisible(true)
    target.visible = newVisible

    setLayerGroups(updated)
  }

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
        if (layer === tribalMarkerLayer && !found) {
          const properties = feature.getProperties()
          popup.setPosition(e.coordinate)
          render(<TribalPopup properties={properties} />, popupRef.current)
          popupRef.current.style.display = 'block'
          found = true
        }
      })
      if (!found) popupRef.current.style.display = 'none'
    })

    let lastTap = 0
    map.on('click', e => {
      const now = new Date().getTime()
      const timeSince = now - lastTap
      if (timeSince < 400 && timeSince > 0) {
        map.getView().animate({ zoom: map.getView().getZoom() + 1, duration: 300 })
      } else {
        console.log('Single tap at:', e.coordinate)
      }
      lastTap = now
    })

    return () => map.setTarget(null)
  }, [])

  return (
      <>
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: 'white', borderRadius: 4 }}>
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
