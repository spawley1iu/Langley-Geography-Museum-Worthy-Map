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
import { fromLonLat, toLonLat } from 'ol/proj'

import CountyPopup from './CountyPopup'
import countyData from '../data/counties.geojson?url'

const MapView = () => {
  const mapRef = useRef()
  const popupRef = useRef()
  const [popupData, setPopupData] = useState(null)
  const [overlay, setOverlay] = useState(null)

  useEffect(() => {
    const source = new VectorSource({
      url: countyData,
      format: new GeoJSON()
    })

    const vectorLayer = new VectorLayer({
      source: source,
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

    const olMap = new Map({
      target: mapRef.current,
      layers: [
        new TileLayer({ source: new OSM() }),
        vectorLayer
      ],
      view: new View({
        center: fromLonLat([-98, 39]),
        zoom: 4
      })
    })

    // Setup popup overlay
    const popupOverlay = new Overlay({
      element: popupRef.current,
      autoPan: true,
      autoPanAnimation: { duration: 250 }
    })
    olMap.addOverlay(popupOverlay)
    setOverlay(popupOverlay)

    // Click handler
    olMap.on('singleclick', evt => {
      const features = olMap.getFeaturesAtPixel(evt.pixel)
      if (features && features.length > 0) {
        const props = features[0].getProperties()
        setPopupData(props)
        popupOverlay.setPosition(evt.coordinate)
      } else {
        setPopupData(null)
        popupOverlay.setPosition(undefined)
      }
    })

    return () => olMap.setTarget(null)
  }, [])

  return (
    <>
      <div ref={mapRef} style={{ flexGrow: 1 }} />
      <div ref={popupRef} className="ol-popup">
        {popupData && <CountyPopup data={popupData} />}
      </div>
    </>
  )
}

export default MapView
