// src/components/MapView.jsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import OSM from 'ol/source/OSM';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Circle as CircleStyle, Fill, Stroke, Text } from 'ol/style';
import 'ol/ol.css';
import './MapView.css'; // Create this file for custom popup styles

// Component Imports
import CountyPopup from './CountyPopup';
import TribalPopup from './TribalPopup';
import LayerToggle from './LayerToggle';
import MobileDrawer from './MobileDrawer';
import Legend from './Legend';
import SearchBox from './SearchBox';
import StoryMode from './StoryMode';

// Layer Imports
import reservationsLayer from '../ol/layers/reservationsLayer';
import ancestralLayer from '../ol/layers/ancestralLayer';

const tribalMarkersUrl = '/data/tribal-markers-geocoded.geojson';

// --- MAIN COMPONENT --------------------------------------------------------
export default function MapView() {
  const mapRef = useRef();
  const popupRef = useRef();
  const [mapInstance, setMapInstance] = useState(null);
  const [highlightSource, setHighlightSource] = useState(null);

  // --- Popup State (React-friendly approach) ---
  const [popupContent, setPopupContent] = useState(null);
  const [popupPosition, setPopupPosition] = useState(undefined);

  // --- Shared Vector Source for Efficiency ---
  const countySource = useRef(new VectorSource({
    url: '/data/counties.geojson',
    format: new GeoJSON()
  }));

  // --- Vector Layers ---
  const [layers] = useState({
    aiAn: new VectorLayer({ source: countySource.current, className: 'ai_an', visible: true }),
    poverty: new VectorLayer({ source: countySource.current, visible: true }),
    income: new VectorLayer({ source: countySource.current, visible: true }),
    tribalMarkers: new VectorLayer({
      source: new VectorSource({ url: tribalMarkersUrl, format: new GeoJSON() }),
      style: feature => new Style({
        image: new CircleStyle({ radius: 6, fill: new Fill({ color: '#ff6600' }), stroke: new Stroke({ color: '#fff', width: 2 }) }),
        text: new Text({ text: feature.get('tribeName') || 'Unknown', font: '12px sans-serif', fill: new Fill({ color: '#222' }), stroke: new Stroke({ color: '#fff', width: 3 }), offsetY: -12 })
      }),
      visible: true
    }),
    reservations: reservationsLayer,
    ancestral: ancestralLayer,
  });

  // --- Layer Toggle State ---
  const [layerGroups, setLayerGroups] = useState({
    'Demographics': {
      'AI/AN %': { layer: layers.aiAn, visible: true },
      'Poverty': { layer: layers.poverty, visible: true },
      'Income': { layer: layers.income, visible: true }
    },
    'Points of Interest': {
      'Tribal Markers': { layer: layers.tribalMarkers, visible: true }
    }
  });

  // --- Search State ---
  const [tribeNames, setTribeNames] = useState([]);
  useEffect(() => {
    fetch(tribalMarkersUrl)
        .then(res => res.json())
        .then(json => {
          const names = json.features.map(f => f.properties.tribeName).filter(Boolean).sort();
          setTribeNames(names);
        });
  }, []);

  const zoomToTribe = useCallback((tribeName) => {
    const source = layers.tribalMarkers.getSource();
    const feat = source.getFeatures().find(f => f.get('tribeName') === tribeName);
    if (feat && mapInstance) {
      const coords = feat.getGeometry().getCoordinates();
      mapInstance.getView().animate({ center: coords, zoom: 6, duration: 600 });
    }
  }, [layers.tribalMarkers, mapInstance]);

  // --- Immutable Layer Toggle Function ---
  const toggleLayer = useCallback((layer) => {
    const isVisible = layer.getVisible();
    layer.setVisible(!isVisible);
    // Force a re-render to update UI elements that depend on visibility
    setLayerGroups(prev => ({ ...prev }));
  }, []);

  // --- MAP INITIALIZATION ---
  useEffect(() => {
    if (!mapRef.current || mapInstance) return; // Prevent re-initialization

    const map = new Map({
      target: mapRef.current,
      view: new View({ center: [-10500000, 5000000], zoom: 4 }),
      layers: [
        new TileLayer({ source: new OSM() }),
        ...Object.values(layers) // Add all layers from our state object
      ],
      overlays: [
        new Overlay({
          element: popupRef.current,
          autoPan: { animation: { duration: 250 } }
        })
      ]
    });

    const hlSource = new VectorSource();
    map.addLayer(new VectorLayer({
      source: hlSource,
      style: new Style({ image: new CircleStyle({ radius: 14, fill: null, stroke: new Stroke({ color: 'yellow', width: 4 }) }) })
    }));

    setMapInstance(map);
    setHighlightSource(hlSource);

    return () => {
      map.setTarget(null);
      setMapInstance(null);
    };
  }, [layers]); // Dependency on layers object

  // --- MAP EVENT HANDLING ---
  useEffect(() => {
    if (!mapInstance) return;

    // Tooltip for Ancestral Lands
    const handlePointerMove = (e) => {
      const features = mapInstance.getFeaturesAtPixel(e.pixel, {
        layerFilter: (l) => l === layers.ancestral,
        hitTolerance: 4
      });

      if (features.length > 0) {
        const feature = features[0];
        const label = feature.get('name') || 'Unnamed Territory';
        setPopupContent(`<strong>${label}</strong>`);
        setPopupPosition(e.coordinate);
        mapInstance.getTargetElement().style.cursor = 'pointer';
      } else {
        setPopupContent(null);
        setPopupPosition(undefined);
        mapInstance.getTargetElement().style.cursor = '';
      }
    };

    // Click Popup for Counties & Tribes
    const handleSingleClick = (e) => {
      let content = null;
      const features = mapInstance.getFeaturesAtPixel(e.pixel, { hitTolerance: 4 });

      if (features.length > 0) {
        const feature = features[0];
        const layer = mapInstance.forEachFeatureAtPixel(e.pixel, (f, l) => l, { hitTolerance: 4 });

        if (layer === layers.aiAn) {
          content = <CountyPopup feature={feature} />;
        } else if (layer === layers.tribalMarkers) {
          content = <TribalPopup name={feature.get('tribeName')} properties={feature.getProperties()} />;
        }
      }

      setPopupContent(content);
      setPopupPosition(content ? e.coordinate : undefined);
    };

    mapInstance.on('pointermove', handlePointerMove);
    mapInstance.on('singleclick', handleSingleClick);

    return () => {
      mapInstance.un('pointermove', handlePointerMove);
      mapInstance.un('singleclick', handleSingleClick);
    };
  }, [mapInstance, layers]);

  // Update overlay position when state changes
  useEffect(() => {
    if (!mapInstance) return;
    const overlay = mapInstance.getOverlays().getArray()[0];
    overlay.setPosition(popupPosition);
  }, [popupPosition, mapInstance]);

  // --- RENDER ---
  return (
      <>
        <div ref={mapRef} style={{ width: '100vw', height: '100vh' }} />

        <div ref={popupRef} className="ol-popup">
          {/* Popup content is now rendered here by React */}
          <div dangerouslySetInnerHTML={{ __html: typeof popupContent === 'string' ? popupContent : '' }} />
          {React.isValidElement(popupContent) && popupContent}
        </div>

        <div className="searchbox-container">
          <SearchBox tribes={tribeNames} onSelect={zoomToTribe} />
        </div>

        {mapInstance && highlightSource && (
            <StoryMode
                map={mapInstance}
                highlightSource={highlightSource}
                ancestralLayer={layers.ancestral}
                reservationsLayer={layers.reservations}
            />
        )}

        <MobileDrawer>
          <LayerToggle layerGroups={layerGroups} toggleLayer={(group, name) => toggleLayer(layerGroups[group][name].layer)} />
          <Legend
              toggleReservation={() => toggleLayer(layers.reservations)}
              toggleAncestral={() => toggleLayer(layers.ancestral)}
              reservationVisible={layers.reservations.getVisible()}
              ancestralVisible={layers.ancestral.getVisible()}
          />
        </MobileDrawer>
      </>
  );
}