'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Map, View, Overlay } from 'ol';
import TileLayer from 'ol/layer/Tile';
import { Vector as VectorLayer } from 'ol/layer';
import { Vector as VectorSource } from 'ol/source';
import XYZ from 'ol/source/XYZ';
import GeoJSON from 'ol/format/GeoJSON';
import { Style, Circle as CircleStyle, Fill, Stroke } from 'ol/style';
import 'ol/ol.css';

// --- Helper & API Functions ---
const NATIVE_LAND_API_KEY = "ekRk3AZoMhflctGvHkHPT";

const callGeminiAPI = async (prompt) => {
  const apiKey = ""; // Handled by environment
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;
  const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 8192 } };
  try {
    const response = await fetch(apiUrl, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const result = await response.json();
    return result.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error: Could not contact the AI model. Please check the browser console for details.";
  }
};

const fetchNativeLandData = async (lat, lng) => {
  const url = `https://native-land.ca/api/index.php?maps=territories&lat=${lat}&lng=${lng}`;
  try {
    const response = await fetch(url, { headers: { 'Authorization': `Bearer ${NATIVE_LAND_API_KEY}` } });
    if (!response.ok) return { names: [], features: [] };
    const data = await response.json();
    const names = Array.isArray(data) ? data.map(t => t.properties.Name) : [];
    const features = Array.isArray(data) ? data : [];
    return { names, features };
  } catch (error) {
    console.error("Native Land API Error:", error);
    return { names: [], features: [] };
  }
};


// --- Child Components ---
const GeminiResponseDisplay = ({ title, content, isLoading }) => (
    <div className="mt-4">
      <h4 className="text-md font-bold font-title text-amber-300">{title}</h4>
      <div className="mt-1 p-3 bg-black/30 rounded-md text-sm text-gray-300 leading-relaxed whitespace-pre-wrap h-32 overflow-y-auto">
        {isLoading ? <div className="spinner mx-auto"></div> : (content || 'Click a button above to generate.')}
      </div>
    </div>
);

const TribalPopup = ({ properties }) => {
  const [story, setStory] = useState("");
  const [history, setHistory] = useState("");
  const [loadingState, setLoadingState] = useState({ story: false, history: false });

  if (!properties) return null;

  const handleGenerateStory = useCallback(async () => {
    setLoadingState(p => ({...p, story: true})); setStory("");
    const prompt = `Tell me a short, traditional-style story about the ${properties.name} people, focusing on their relationship with the land, a key animal, or a cultural value.`;
    const result = await callGeminiAPI(prompt);
    setStory(result); setLoadingState(p => ({...p, story: false}));
  }, [properties.name]);

  const handleGenerateHistory = useCallback(async () => {
    setLoadingState(p => ({...p, history: true})); setHistory("");
    const prompt = `For the ${properties.name} nation, list 3-4 significant historical moments or periods in a bulleted list. Provide a brief one-sentence description for each.`;
    const result = await callGeminiAPI(prompt);
    setHistory(result); setLoadingState(p => ({...p, history: false}));
  }, [properties.name]);

  return (
      <div className="p-1 max-w-sm">
        <h3 className="text-xl font-bold font-title text-white">{properties.name}</h3>
        <p className="text-sm text-gray-400 mb-2">{properties.description}</p>
        <div className="border-t border-gray-700 pt-2">
          <button onClick={handleGenerateStory} disabled={loadingState.story} className="w-full flex items-center justify-center text-center p-2 mb-2 bg-amber-600/50 hover:bg-amber-500/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loadingState.story ? <div className="spinner"></div> : "✨ Tell Me a Story"}
          </button>
          <GeminiResponseDisplay title="A Story" content={story} isLoading={loadingState.story} />
          <button onClick={handleGenerateHistory} disabled={loadingState.history} className="w-full flex items-center justify-center text-center p-2 mt-4 mb-2 bg-amber-600/50 hover:bg-amber-500/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loadingState.history ? <div className="spinner"></div> : "✨ Key Historical Moments"}
          </button>
          <GeminiResponseDisplay title="Key Moments" content={history} isLoading={loadingState.history} />
        </div>
      </div>
  );
};


// --- The Main MapView Component ---
const MapView = () => {
  const mapRef = useRef();
  const popupRef = useRef();
  const popupRoot = useRef(null);
  const [mapInstance, setMapInstance] = useState(null);
  const [popupContent, setPopupContent] = useState(null);
  const [popupPosition, setPopupPosition] = useState(undefined);

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mapCenter, setMapCenter] = useState([-98.5, 39.8]);
  const [landHistory, setLandHistory] = useState("");
  const [isLandHistoryLoading, setIsLandHistoryLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [tribeNames, setTribeNames] = useState([]);
  const fuse = new Fuse(tribeNames, { threshold: 0.4 });
  const [layers, setLayers] = useState({});
  const [visibleLayers, setVisibleLayers] = useState({
    reservations: true,
    ancestral: true,
    tribalMarkers: true
  });

  // --- Search Logic ---
  useEffect(() => {
    fetch('/data/tribal-markers-geocoded.geojson')
        .then(res => res.json())
        .then(data => {
          const names = data.features.map(f => f.properties.name).filter(Boolean).sort();
          setTribeNames(names);
        });
  }, []);

  useEffect(() => {
    if (searchQuery.length > 1) setSearchResults(fuse.search(searchQuery).slice(0, 5));
    else setSearchResults([]);
  }, [searchQuery, tribeNames]);

  const zoomToTribe = useCallback((tribeName) => {
    if (!mapInstance || !layers.tribalMarkers) return;
    const source = layers.tribalMarkers.getSource();
    const feat = source.getFeatures().find(f => f.get('name') === tribeName);
    if (feat) {
      const coords = feat.getGeometry().getCoordinates();
      mapInstance.getView().animate({ center: coords, zoom: 8, duration: 600 });
      setSidebarOpen(false);
    }
  }, [layers.tribalMarkers, mapInstance]);

  // --- Map Initialization ---
  useEffect(() => {
    if (!mapRef.current || mapInstance) return;

    const ancestralSource = new VectorSource();
    const newLayers = {
      reservations: new VectorLayer({ source: new VectorSource({ url: '/data/reservations.geojson', format: new GeoJSON() }), style: new Style({ stroke: new Stroke({ color: '#ffc107', width: 2 }), fill: new Fill({ color: 'rgba(255, 193, 7, 0.1)' }) }), zIndex: 2 }),
      ancestral: new VectorLayer({ source: ancestralSource, style: new Style({ fill: new Fill({ color: 'rgba(107, 33, 168, 0.3)' }), stroke: new Stroke({ color: 'rgba(192, 132, 252, 0.5)', width: 1, lineDash: [5, 10] }) }), zIndex: 0 }),
      tribalMarkers: new VectorLayer({ source: new VectorSource({ url: '/data/tribal-markers-geocoded.geojson', format: new GeoJSON() }), style: new Style({ image: new CircleStyle({ radius: 5, fill: new Fill({ color: '#ff6600' }), stroke: new Stroke({ color: '#fff', width: 1.5 }) }) }), zIndex: 3 })
    };
    setLayers(newLayers);

    const popupOverlay = new Overlay({ element: popupRef.current, autoPan: { animation: { duration: 250 } } });

    const map = new Map({
      target: mapRef.current,
      view: new View({ center: [-10997148, 4814500], zoom: 4 }),
      layers: [
        new TileLayer({ source: new XYZ({ url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' }) }),
        newLayers.reservations,
        newLayers.ancestral,
        newLayers.tribalMarkers
      ],
      overlays: [popupOverlay]
    });

    setMapInstance(map);

    return () => map.setTarget(null);
  }, []);

  // --- Popup and Event Handling ---
  useEffect(() => {
    if (!mapInstance || !popupRef.current) return;
    if (!popupRoot.current) popupRoot.current = ReactDOM.createRoot(popupRef.current);
    const overlay = mapInstance.getOverlays().getArray()[0];

    const handleMapClick = (e) => {
      let foundFeature = false;
      mapInstance.forEachFeatureAtPixel(e.pixel, (feature, layer) => {
        if (foundFeature) return; // Process only the top-most feature
        if (layer === layers.tribalMarkers) {
          setPopupContent(<TribalPopup properties={feature.getProperties()} />);
          overlay.setPosition(e.coordinate);
          foundFeature = true;
        }
      });
      if (!foundFeature) {
        setPopupContent(null);
        overlay.setPosition(undefined);
      }
    };

    mapInstance.on('click', handleMapClick);
    return () => mapInstance.un('click', handleMapClick);
  }, [mapInstance, layers]);

  useEffect(() => {
    if (popupRoot.current) {
      popupRoot.current.render(<div className="p-1 bg-[#1a1a1a]/80 backdrop-blur-sm border border-gray-700 rounded-lg shadow-lg">{popupContent}</div>);
    }
  }, [popupContent]);

  // --- Dynamic Layer Logic ---
  const updateAncestralLands = useCallback(() => {
    if (!mapInstance || !layers.ancestral) return;
    const extent = mapInstance.getView().calculateExtent(mapInstance.getSize());
    const [minLon, minLat, maxLon, maxLat] = ol.proj.transformExtent(extent, 'EPSG:3857', 'EPSG:4326');
    const bbox = `${minLon},${minLat},${maxLon},${maxLat}`;
    const url = `https://native-land.ca/api/index.php?maps=territories&bbox=${bbox}`;

    fetch(url, { headers: { 'Authorization': `Bearer ${NATIVE_LAND_API_KEY}` } })
        .then(res => res.ok ? res.json() : Promise.resolve([]))
        .then(data => {
          if (Array.isArray(data)) {
            const features = new GeoJSON({ featureProjection: 'EPSG:3857' }).readFeatures({ type: 'FeatureCollection', features: data });
            layers.ancestral.getSource().clear();
            layers.ancestral.getSource().addFeatures(features);
          }
        }).catch(e => console.error("Could not fetch ancestral lands:", e));
  }, [mapInstance, layers.ancestral]);

  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.on('moveend', () => {
      setMapCenter(ol.proj.toLonLat(mapInstance.getView().getCenter()));
      if (layers.ancestral && layers.ancestral.getVisible()) {
        updateAncestralLands();
      }
    });
  }, [mapInstance, layers.ancestral, updateAncestralLands]);

  // --- Layer Visibility Control ---
  const toggleLayerVisibility = (layerKey) => {
    setVisibleLayers(prev => {
      const newVisibility = { ...prev, [layerKey]: !prev[layerKey] };
      if (layers[layerKey]) {
        layers[layerKey].setVisible(newVisibility[layerKey]);
        // Special case to load ancestral data if it's turned on
        if (layerKey === 'ancestral' && newVisibility[layerKey]) {
          updateAncestralLands();
        }
      }
      return newVisibility;
    });
  };

  // --- Gemini AI Handler ---
  const handleAskAboutLand = useCallback(async () => {
    setIsLandHistoryLoading(true); setLandHistory("");
    const [lon, lat] = mapCenter;
    const territoryNames = await fetchNativeLandData(lat, lon);
    let territoryInfo = territoryNames.length > 0 ? ` This area is within or near the ancestral territories of the ${territoryNames.join(", ")}.` : "";
    const prompt = `For the geographic coordinates ${lat.toFixed(4)}, ${lon.toFixed(4)} in the USA, provide a brief summary of the Indigenous history of this specific area.${territoryInfo} Mention primary historical tribes, significant treaties or events, and any contemporary recognized nations associated with this land. Keep it concise for a museum exhibit.`;
    const result = await callGeminiAPI(prompt);
    setLandHistory(result); setIsLandHistoryLoading(false);
  }, [mapCenter]);

  return (
      <div className="relative w-screen h-screen bg-[#1A1A1A] text-gray-200">
        <div ref={mapContainerRef} className="w-full h-full" />
        <div ref={popupRef} />

        <button onClick={() => setSidebarOpen(true)} className={`fixed top-4 left-4 z-[1001] p-2 bg-black/50 rounded-md hover:bg-gray-800 transition-transform duration-300 ${sidebarOpen ? 'translate-x-[20rem]' : 'translate-x-0'}`}>
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path></svg>
        </button>

        <div className={`fixed top-0 left-0 h-full w-80 bg-black/70 backdrop-blur-md border-r border-gray-700 z-[1000] p-4 transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} flex flex-col`}>
          <h2 className="text-3xl font-title text-white mb-4">Explore the Map</h2>
          <div className="relative">
            <label htmlFor="tribe-search" className="block text-sm font-medium text-gray-400 mb-1">Search Federally Recognized Tribes</label>
            <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-gray-800 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-yellow-500" placeholder="e.g., Cherokee, Navajo..." />
            {searchResults.length > 0 && (
                <div className="absolute z-20 w-full bg-gray-800 border border-gray-600 rounded-md mt-1 max-h-60 overflow-y-auto">{searchResults.map(result => <div key={result.item} onClick={() => { zoomToTribe(result.item); setSearchQuery(''); }} className="p-2 cursor-pointer hover:bg-gray-700">{result.item}</div>)}</div>
            )}
          </div>
          <h3 className="text-2xl font-title text-white mt-6 mb-3">Data Layers</h3>
          <div className="space-y-3">
            <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={visibleLayers.reservations} onChange={() => toggleLayerVisibility('reservations')} className="h-5 w-5 rounded bg-gray-700 border-gray-500 custom-checkbox"/><span>Reservations</span></label>
            <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={visibleLayers.ancestral} onChange={() => toggleLayerVisibility('ancestral')} className="h-5 w-5 rounded bg-gray-700 border-gray-500 custom-checkbox"/><span>Ancestral Lands</span></label>
            <label className="flex items-center space-x-2 cursor-pointer"><input type="checkbox" checked={visibleLayers.tribalMarkers} onChange={() => toggleLayerVisibility('tribalMarkers')} className="h-5 w-5 rounded bg-gray-700 border-gray-500 custom-checkbox"/><span>Tribal Markers</span></label>
          </div>
          <div className="mt-auto pt-4 border-t border-gray-700">
            <button onClick={handleAskAboutLand} disabled={isLandHistoryLoading} className="w-full flex items-center justify-center text-center p-2 mb-2 bg-yellow-600/50 hover:bg-yellow-500/50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
              <span className={`btn-text ${isLandHistoryLoading ? 'hidden' : ''}`}>✨ Ask About This Land</span>
              <div className={`spinner ${!isLandHistoryLoading && 'hidden'}`}></div>
            </button>
            <GeminiResponseDisplay title="Land History" content={landHistory} isLoading={isLandHistoryLoading} />
          </div>
        </div>

        <TribeModal tribeName={selectedTribe} open={!!selectedTribe} handleClose={() => setSelectedTribe(null)} />
      </div>
  );
};

