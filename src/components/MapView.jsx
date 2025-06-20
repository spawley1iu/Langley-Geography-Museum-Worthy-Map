import React, { useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import GeoJSON from 'ol/format/GeoJSON'
import { Fill, Stroke, Style } from 'ol/style'
import Overlay from 'ol/Overlay'
import { fromLonLat } from 'ol/proj'

import CountyPopup from './CountyPopup'
import Sidebar from './Sidebar'
import Legend from './Legend'

import countyData from '../data/counties.geojson?url'
import reservationData from '../data/reservations.geojson?url'
import tribalLandData from '../data/tribal-lands.geojson?url'
import markerData from '../data/tribal-markers.json'

const MapView = () => {
  const mapRef = useRef()
  const popupRef = useRef()
  const [popupData, setPopupData] = useState(null)
  const [overlay, setOverlay] = useState(null)
  const [layerVisibility, setLayerVisibility] = useState({
    reservations: false,
    tribalLands: false
  })

  const [reservationLayer, setReservationLayer] = useState(null)
  const [tribalLayer, setTribalLayer] = useState(null)
  const [countyLayer, setCountyLayer] = useState(null)

  useEffect(() => {
    const source = new VectorSource({ url: countyData, format: new GeoJSON() })

    const county = new VectorLayer({
      source: source,
      className: 'fade-layer',
      style: feature => {
        const value = feature.get('ai_an_pct')
        let fill = '#eee'
        if (value > 50) fill = '#084081'
        else if (value > 20) fill = '#2b8cbe'
        else if (value > 10) fill = '#7bccc4'
        else if (value > 1) fill = '#bae4bc'
        return new Style({
          fill: new Fill({ color: fill }),
          stroke: new Stroke({ color: '#444', width: 0.5 })
        })
      }
    })

    const map = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        county
      ],
      view: new View({
        center: fromLonLat([-98, 39]),
        zoom: 4
      })
    })

    const popupOverlay = new Overlay({
      element: popupRef.current,
      autoPan: true,
      autoPanAnimation: { duration: 250 }
    })
    map.addOverlay(popupOverlay)
    setOverlay(popupOverlay)

    map.on('singleclick', evt => {
      const features = map.getFeaturesAtPixel(evt.pixel)
      if (features && features.length > 0) {
        const props = features[0].getProperties()
        setPopupData(props)
        popupOverlay.setPosition(evt.coordinate)
      } else {
        setPopupData(null)
        popupOverlay.setPosition(undefined)
      }
    })

    // Add reservations
    const reservations = new VectorLayer({
      source: new VectorSource({ url: reservationData, format: new GeoJSON() }),
      visible: false,
      style: new Style({
        stroke: new Stroke({ color: '#ff1744', width: 2 }),
        fill: new Fill({ color: 'rgba(255, 23, 68, 0.05)' })
      })
    })

    const tribes = new VectorLayer({
      source: new VectorSource({ url: tribalLandData, format: new GeoJSON() }),
      visible: false,
      style: new Style({
        stroke: new Stroke({ color: '#8e24aa', width: 1.5 }),
        fill: new Fill({ color: 'rgba(142, 36, 170, 0.2)' })
      })
    })

    map.addLayer(reservations)
    map.addLayer(tribes)

    setCountyLayer(county)
    setReservationLayer(reservations)
    setTribalLayer(tribes)

    // 🔥 Add animated pulsing markers
    markerData.forEach(({ name, lon, lat, color }) => {
      const el = document.createElement('div')
      el.className = 'pulse-marker'
      el.style.backgroundColor = color
      el.title = name
      const markerOverlay = new Overlay({
        position: fromLonLat([lon, lat]),
        positioning: 'center-center',
        element: el,
        stopEvent: false
      })
      map.addOverlay(markerOverlay)
    })

    return () => map.setTarget(null)
  }, [])

  useEffect(() => {
    if (reservationLayer) reservationLayer.setVisible(layerVisibility.reservations)
    if (tribalLayer) tribalLayer.setVisible(layerVisibility.tribalLands)
    if (countyLayer) {
      const el = document.querySelector('.fade-layer')
      if (el) {
        if (layerVisibility.tribalLands || layerVisibility.reservations) {
          el.classList.add('hidden')
        } else {
          el.classList.remove('hidden')
        }
      }
    }
  }, [layerVisibility, reservationLayer, tribalLayer, countyLayer])

  return (
    <>
      <Sidebar layerVisibility={layerVisibility} setLayerVisibility={setLayerVisibility} />
      <div ref={mapRef} style={{ flexGrow: 1 }} />
      <div ref={popupRef} className="ol-popup">
        {popupData && <CountyPopup data={popupData} />}
      </div>
      <Legend />
    </>
  )
}

export default MapView
