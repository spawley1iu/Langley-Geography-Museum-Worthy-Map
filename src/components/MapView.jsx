import React, { useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import TileLayer from 'ol/layer/Tile'
import VectorLayer from 'ol/layer/Vector'
import VectorSource from 'ol/source/Vector'
import OSM from 'ol/source/OSM'
import GeoJSON from 'ol/format/GeoJSON'
import { Fill, Stroke, Style, Text } from 'ol/style'
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
  const [layerVisibility, setLayerVisibility] = useState({
    reservations: false,
    tribalLands: false
  })

  const [reservationLayer, setReservationLayer] = useState(null)
  const [tribalLayer, setTribalLayer] = useState(null)
  const [countyLayer, setCountyLayer] = useState(null)

  useEffect(() => {
    const countySrc = new VectorSource({ url: countyData, format: new GeoJSON() })
    const countyLayer = new VectorLayer({
      source: countySrc,
      className: 'fade-layer',
      style: f => {
        const v = f.get('ai_an_pct')
        let fill = '#eee'
        if (v > 50) fill = '#084081'
        else if (v > 20) fill = '#2b8cbe'
        else if (v > 10) fill = '#7bccc4'
        else if (v > 1) fill = '#bae4bc'
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
        countyLayer
      ],
      view: new View({ center: fromLonLat([-98, 39]), zoom: 4 })
    })

    const popupOverlay = new Overlay({
      element: popupRef.current,
      autoPan: true,
      autoPanAnimation: { duration: 250 }
    })
    map.addOverlay(popupOverlay)

    map.on('singleclick', evt => {
      const feats = map.getFeaturesAtPixel(evt.pixel)
      if (feats?.length) {
        setPopupData(feats[0].getProperties())
        popupOverlay.setPosition(evt.coordinate)
      } else {
        setPopupData(null)
        popupOverlay.setPosition(undefined)
      }
    })

    const reservations = new VectorLayer({
      source: new VectorSource({ url: reservationData, format: new GeoJSON() }),
      visible: false,
      style: new Style({
        stroke: new Stroke({ color: '#ff1744', width: 2 }),
        fill: new Fill({ color: 'rgba(255,23,68,0.05)' })
      })
    })

    const tribes = new VectorLayer({
      source: new VectorSource({ url: tribalLandData, format: new GeoJSON() }),
      visible: false,
      style: f => new Style({
        fill: new Fill({ color: 'rgba(142,36,170,0.1)' }),
        stroke: new Stroke({ color: '#6a1b9a', width: 1 }),
        text: new Text({
          text: f.get('name') || f.get('Tribe_Name') || '',
          font: '12px sans-serif',
          fill: new Fill({ color: '#222' }),
          stroke: new Stroke({ color: '#fff', width: 2 }),
          overflow: true
        })
      })
    })

    map.addLayer(reservations)
    map.addLayer(tribes)

    markerData.forEach(({ name, lon, lat, color }) => {
      const el = document.createElement('div')
      el.className = 'pulse-marker'
      el.style.backgroundColor = color
      el.title = name
      map.addOverlay(new Overlay({
        position: fromLonLat([lon, lat]),
        positioning: 'center-center',
        element: el,
        stopEvent: false
      }))
    })

    setReservationLayer(reservations)
    setTribalLayer(tribes)
    setCountyLayer(countyLayer)

    return () => map.setTarget(null)
  }, [])

  useEffect(() => {
    reservationLayer?.setVisible(layerVisibility.reservations)
    tribalLayer?.setVisible(layerVisibility.tribalLands)
    document.querySelector('.fade-layer')?.classList.toggle(
      'hidden',
      layerVisibility.reservations || layerVisibility.tribalLands
    )
  }, [layerVisibility, reservationLayer, tribalLayer])

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
