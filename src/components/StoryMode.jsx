// src/components/StoryMode.jsx
import React, { useState, useEffect } from 'react'
import { fromLonLat } from 'ol/proj'
import storyData from '../data/storyData.json'
export default function StoryMode({ map }) {
    const [slides, setSlides] = useState([])
    const [idx, setIdx] = useState(0)

    // Load the slides once on mount
    useEffect(() => {
        setSlides(storyData)
    }, [])

    // Pan & zoom whenever the slide index changes
    useEffect(() => {
        if (!map || slides.length === 0) return
        const slide = slides[idx]
        const center = fromLonLat(slide.coordinates)
        map.getView().animate({
            center,
            zoom: slide.zoom || 6,
            duration: 600
        })
    }, [idx, map, slides])

    if (slides.length === 0) return null

    const { title, description, image, audio, youtube, link } = slides[idx]

    return (
        <div className="story-mode-panel">
            <h2 className="story-mode-title">{title}</h2>

            {image && (
                <img
                    src={image}
                    alt={title}
                    className="story-mode-image"
                />
            )}

            <p className="story-mode-description">{description}</p>

            {audio && (
                <audio controls className="story-mode-audio">
                    <source src={audio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            )}

            {youtube && (
                <div className="story-mode-video">
                    <iframe
                        width="100%"
                        height="250"
                        src={youtube.replace('watch?v=', 'embed/')}
                        frameBorder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title={`Video for ${title}`}
                    />
                </div>
            )}

            {link && (
                <p className="story-mode-link">
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        Learn more →
                    </a>
                </p>
            )}

            <div className="story-mode-controls">
                <button
                    onClick={() => setIdx(i => Math.max(0, i - 1))}
                    disabled={idx === 0}
                >
                    ← Previous
                </button>
                <span className="story-mode-counter">
          {idx + 1} / {slides.length}
        </span>
                <button
                    onClick={() => setIdx(i => Math.min(slides.length - 1, i + 1))}
                    disabled={idx === slides.length - 1}
                >
                    Next →
                </button>
            </div>
        </div>
    )
}
