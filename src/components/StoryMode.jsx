// src/components/StoryMode.jsx
import React, { useState, useEffect } from 'react'
import '../styles/StoryMode.css'
import storySlides from '../data/storyData.json'

export default function StoryMode({ map, highlightSource }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const slide = storySlides[currentIndex]

    // when slide changes, clear highlight & pan/zoom to feature
    useEffect(() => {
        if (!map || !highlightSource || !slide) return

        highlightSource.clear()

        let sourceLayer
        switch (slide.type) {
            case 'tribe':
                sourceLayer = map
                    .getLayers()
                    .getArray()
                    .find((l) => l.getSource()?.getUrl?.()?.includes('tribal-markers'))
                break
            case 'land':
                sourceLayer = map
                    .getLayers()
                    .getArray()
                    .find((l) => l === slide.featureName && l.getSource) // adjust if you pass the actual ancestralLayer
                break
            case 'event':
                sourceLayer = map
                    .getLayers()
                    .getArray()
                    .find((l) => l === slide.featureName && l.getSource) // adjust if you pass the actual reservationsLayer
                break
            default:
                sourceLayer = null
        }

        const source = sourceLayer?.getSource()
        if (source) {
            const feat = source.getFeatures().find((f) => f.get('name') === slide.featureName)
            if (feat) {
                highlightSource.addFeature(feat.clone())
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
            <h2>{slide.title || slide.featureName}</h2>
            {slide.image && (
                <img src={slide.image} alt={slide.title} className="story-image" />
            )}
            <p>{slide.description}</p>
            {slide.audio && (
                <audio controls className="story-audio">
                    <source src={slide.audio} type="audio/mpeg" />
                    Your browser doesn’t support audio.
                </audio>
            )}
            {slide.videoUrl && (
                <div className="story-video">
                    <iframe
                        width="100%"
                        height="200"
                        src={slide.videoUrl.replace('watch?v=', 'embed/')}
                        frameBorder="0"
                        allow="autoplay; encrypted-media"
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
