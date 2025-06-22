// src/components/StoryMode.jsx
import React, { useState, useEffect } from 'react'
import storySlides from '../data/storyData.json'
import '../styles/StoryMode.css';

export default function StoryMode({ map, highlightSource }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const slide = storySlides[currentIndex]

    // whenever slide changes, clear highlight & zoom to the actual feature
    useEffect(() => {
        if (!map || !highlightSource || !slide) return
        highlightSource.clear()

        let source
        if (slide.type === 'tribe') {
            source = map
                .getLayers()
                .getArray()
                .find(l => l.getSource()?.getUrl?.()?.includes('tribal-markers'))
                .getSource()
        } else if (slide.type === 'land') {
            source = map
                .getLayers()
                .getArray()
                .find(l => l === ancestralLayer)
                .getSource()
        } else if (slide.type === 'reservation') {
            source = map
                .getLayers()
                .getArray()
                .find(l => l === reservationsLayer)
                .getSource()
        }

        if (!source) return

        // find the matching feature by property
        const feat = source
            .getFeatures()
            .find(f =>
                slide.type === 'tribe'
                    ? f.get('tribeName') === slide.featureName
                    : f.get('name') === slide.featureName
            )
        if (!feat) return

        // highlight it
        highlightSource.addFeature(feat.clone())

        // pan+zoom to its geometry
        const coords = feat.getGeometry().getCoordinates()
        map.getView().animate({ center: coords, zoom: slide.zoom || 6, duration: 600 })
    }, [currentIndex, map, highlightSource, slide])

    if (!slide) return null

    return (
        <div className="story-mode-panel">
            <h2>{slide.title}</h2>
            {slide.image && <img src={slide.image} alt={slide.title} className="story-image" />}
            <p>{slide.description}</p>

            {slide.audio && (
                <audio controls className="story-audio">
                    <source src={slide.audio} type="audio/mpeg" />
                </audio>
            )}

            {slide.videoUrl && (
                <div className="story-video">
                    <iframe
                        width="100%"
                        height="200"
                        src={slide.videoUrl.replace('watch?v=', 'embed/')}
                        frameBorder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={slide.featureName}
                    />
                </div>
            )}

            {slide.link && (
                <p>
                    <a href={slide.link} target="_blank" rel="noopener noreferrer">
                        Learn more →
                    </a>
                </p>
            )}

            <div className="story-controls">
                <button
                    onClick={() => setCurrentIndex(i => (i > 0 ? i - 1 : storySlides.length - 1))}
                >
                    ← Previous
                </button>
                <span>
          {currentIndex + 1} / {storySlides.length}
        </span>
                <button
                    onClick={() =>
                        setCurrentIndex(i => (i < storySlides.length - 1 ? i + 1 : 0))
                    }
                >
                    Next →
                </button>
            </div>
        </div>
    )
}