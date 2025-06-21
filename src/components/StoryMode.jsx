// src/components/StoryMode.jsx
import React, { useState, useEffect } from 'react'
import storySlides from 'src/data/storyData.json'
import './styles/StoryMode.css'

// import the same layer objects you use in MapView:
import ancestralLayer from '../ol/layers/ancestralLayer'
import reservationsLayer from '../ol/layers/reservationsLayer'

export default function StoryMode({ map, highlightSource }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const slide = storySlides[currentIndex]

    useEffect(() => {
        if (!map || !highlightSource || !slide) return

        // clear previous highlight
        highlightSource.clear()

        // pick the right source
        let source = null
        switch (slide.type) {
            case 'tribe':
                // find the tribal‐markers layer by its geojson URL
                const tribeLayer = map
                    .getLayers()
                    .getArray()
                    .find(
                        (l) =>
                            typeof l.getSource === 'function' &&
                            l.getSource().getUrl?.()?.includes('tribal-markers-geocoded.geojson')
                    )
                source = tribeLayer?.getSource()
                break

            case 'land':
                source = ancestralLayer.getSource()
                break

            case 'event':
                source = reservationsLayer.getSource()
                break

            default:
                source = null
        }

        if (source) {
            // find the feature matching this slide’s name
            const feat = source.getFeatures().find((f) => f.get('name') === slide.featureName)
            if (feat) {
                // add a clone to the highlight layer
                highlightSource.addFeature(feat.clone())
                // pan & zoom
                map.getView().animate({
                    center: feat.getGeometry().getCoordinates(),
                    zoom: slide.zoom || 6,
                    duration: 600
                })
            }
        }
    }, [currentIndex, map, highlightSource, slide])

    if (!slide) return null

    return (
        <div className="story-mode-panel">
            <h2>{slide.featureName}</h2>
            <p>{slide.description}</p>

            {slide.videoUrl && (
                <div className="story-video">
                    <iframe
                        width="100%"
                        height="250"
                        src={slide.videoUrl.replace('watch?v=', 'embed/')}
                        frameBorder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={slide.featureName}
                    />
                </div>
            )}

            <div className="story-controls">
                <button
                    onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                    disabled={currentIndex === 0}
                >
                    ← Previous
                </button>
                <span>
          {currentIndex + 1} / {storySlides.length}
        </span>
                <button
                    onClick={() => setCurrentIndex((i) => Math.min(storySlides.length - 1, i + 1))}
                    disabled={currentIndex === storySlides.length - 1}
                >
                    Next →
                </button>
            </div>
        </div>
    )
}
