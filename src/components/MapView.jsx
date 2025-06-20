import React, { useEffect, useRef, useState } from 'react'
import Map from 'ol/Map'
import View from 'ol/View'
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer'
import { OSM } from 'ol/source'
import { Vector as VectorSource } from 'ol/source'
import GeoJSON from 'ol/format/GeoJSON'
import { Style, Stroke, Fill } from 'ol/style'
import Overlay from 'ol/Overlay'
import 'ol/ol.css'
import reservationData from './data/reservations-geocoded.geojson?url'
import ancestralData from './data/ancestral-lands.geojson?url'
import LayerToggle from './components/LayerToggle'

const MapView = () => {
  const mapRef = useRef()
  const popupRef = useRef()
  const reservationLayerRef = useRef()
  const ancestralLayerRef = useRef()

  const [toggles, setToggles] = useState({
    reservations: true,
    ancestral: true
  })

  useEffect(() => {
    const popup = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -10]
    })

    const map = new Map({
      target: mapRef.current,
      layers: [new TileLayer({ source: new OSM() })],
      view: new View({
        center: [-10700000, 4600000],
        zoom: 4
      }),
      overlays: [popup]
    })

    mapRef.current.olMap = map // allow access for toggling layers

    // --- RESERVATION LAYER ---
    fetch(reservationData).then(res => res.json()).then(geojson => {
      const layer = new VectorLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(geojson, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
        }),
        style: new Style({
          stroke: new Stroke({ color: '#d32f2f', width: 2 }),
          fill: new Fill({ color: 'rgba(211,47,47,0.1)' })
        })
      })
      map.addLayer(layer)
      reservationLayerRef.current = layer
    })

    // --- ANCESTRAL LAND LAYER ---
    fetch(ancestralData).then(res => res.json()).then(geojson => {
      const layer = new VectorLayer({
        source: new VectorSource({
          features: new GeoJSON().readFeatures(geojson, {
            dataProjection: 'EPSG:4326',
            featureProjection: 'EPSG:3857'
          })
        }),
        style: new Style({
          stroke: new Stroke({ color: '#00897b', width: 2 }),
          fill: new Fill({ color: 'rgba(0,137,123,0.15)' })
        })
      })
      map.addLayer(layer)
      ancestralLayerRef.current = layer
    })

    map.on('pointermove', (e) => {
      const feature = map.forEachFeatureAtPixel(e.pixel, f => f)
      const name = feature?.get('name') || feature?.get('tribe')
      if (name) {
        popup.setPosition(e.coordinate)
        popupRef.current.innerHTML = `<strong>${name}</strong>`
        popupRef.current.style.display = 'block'
      } else {
        popupRef.current.style.display = 'none'
      }
    })

    return () => map.setTarget(null)
  }, [])

  const toggleLayer = (layerKey) => {
    setToggles(prev => {
      const next = { ...prev, [layerKey]: !prev[layerKey] }
      const map = mapRef.current.olMap
      if (layerKey === 'reservations' && reservationLayerRef.current) {
        reservationLayerRef.current.setVisible(next.reservations)
      }
      if (layerKey === 'ancestral' && ancestralLayerRef.current) {
        ancestralLayerRef.current.setVisible(next.ancestral)
      }
      return next
    })
  }

  return (
      <>
        <LayerToggle toggles={toggles} onChange={toggleLayer} />
        <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />
        <div ref={popupRef} className="ol-popup" style={{
          background: '#fff',
          padding: '6px 10px',
          borderRadius: '4px',
          boxShadow: '0 1px 6px rgba(0,0,0,0.3)',
          display: 'none',
          position: 'absolute',
          bottom: '12px',
          left: '50%',
          transform: 'translateX(-50%)',
          whiteSpace: 'nowrap',
          fontSize: '0.9rem',
          fontWeight: '500',
          pointerEvents: 'none'
        }} />
      </>
  )
}

export default MapView
