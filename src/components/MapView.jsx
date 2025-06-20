// src/components/MapView.jsx
import React, { useEffect } from 'react';
import 'ol/ol.css';
import { Map, View } from 'ol';
import TileLayer from 'ol/layer/Tile';
import OSM from 'ol/source/OSM';
import LayerSwitcher from './LayerSwitcher';
import reservationsLayer from '../ol/layers/reservationsLayer';
import ancestralLayer from '../ol/layers/ancestralLayer';

export default function MapView() {
  useEffect(() => {
    const base = new TileLayer({ source: new OSM() });

    const map = new Map({
      target: 'map',
      layers: [base, reservationsLayer, ancestralLayer],
      view: new View({
        center: [-10500000, 5000000],
        zoom: 4,
      }),
    });

    // Example popup for ancestral lands is handled inside the pointermove hook

    return () => map.setTarget(null);
  }, []);

  const handleLayerChange = (layerKey) => {
    // swap choropleth layer source or style dynamically here
    console.log('Layer changed to:', layerKey);
  };

  return (
      <div>
        <div id="map" style={{ height: '100vh' }}></div>
        <LayerSwitcher onChange={handleLayerChange} />
      </div>
  );
}
