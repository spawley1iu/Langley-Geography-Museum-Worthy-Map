import React, { useEffect, useRef } from 'react'
import 'ol/ol.css'
import { Map, View, Overlay } from 'ol'
import TileLayer from 'ol/layer/Tile'
import OSM from 'ol/source/OSM'
import reservationsLayer from '../ol/layers/reservationsLayer'
import ancestralLayer from '../ol/layers/ancestralLayer'

const MapView = () => {
  const mapRef = useRef(null)
  const popupRef = useRef(null)

  useEffect(() => {
    const baseLayer = new TileLayer({
      source: new OSM()
    })

    const popup = new Overlay({
      element: popupRef.current,
      positioning: 'bottom-center',
      stopEvent: false,
      offset: [0, -15]
    })

    const map = new Map({
      target: mapRef.current,
      layers: [baseLayer, reservationsLayer, ancestralLayer],
      overlays: [popup],
      view: new View({
        center: [-10500000, 5000000], // approximate center of US
        zoom: 4
      })
    })

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
      if (!hoverDone) {
        popupRef.current.style.display = 'none'
      }
    })

    return () => {
      map.setTarget(null)
    }
  }, [])

  return (
      <>
        <div ref={mapRef} style={{ height: '100vh', width: '100vw' }} />
        <div
            ref={popupRef}
            className="ol-popup"
            style={{
              position: 'absolute',
              background: 'white',
              padding: '5px 10px',
              borderRadius: '4px',
              border: '1px solid #ccc',
              boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
              display: 'none',
              pointerEvents: 'none',
              zIndex: 1000
            }}
        />
      </>
  )
}

export default MapView
