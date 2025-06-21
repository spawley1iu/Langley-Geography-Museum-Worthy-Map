import React, { useState, useEffect } from 'react'
import { fromLonLat } from 'ol/proj'
import storyData from '../public/data/storyData.json'
import './styles/StoryMode.css'

export default function StoryMode({ map }) {
    const [slides, setSlides] = useState([])
    const [idx, setIdx] = useState(0)

    // Load JSON on mount
    useEffect(() => {
        setSlides(storyData)
    }, [])

    // Whenever idx or map changes, pan & zoom
    useEffect(() => {
        if (map && slides.length) {
            const slide = slides[idx]
            const center = fromLonLat(slide.coordinates)
            map.getView().animate({ center, zoom: slide.zoom || 6, duration: 600 })
        }
    }, [idx, map, slides])

    if (!slides.length) return null

    const { title, description, image, audio, youtube, link } = slides[idx]

    return (
        <div className="story-mode-panel">
            <h2>{title}</h2>

            {image && <img src={image} alt={title} className="story-image" />}

            <p>{description}</p>

            {audio && (
                <audio controls className="story-audio">
                    <source src={audio} type="audio/mpeg" />
                    Your browser doesn’t support audio.
                </audio>
            )}

            {youtube && (
                <div className="story-video">
                    <iframe
                        width="100%"
                        height="200"
                        src={youtube}
                        frameBorder="0"
                        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="story video"
                    />
                </div>
            )}

            {link && (
                <p>
                    <a href={link} target="_blank" rel="noopener noreferrer">
                        Learn more →
                    </a>
                </p>
            )}

            <div className="story-controls">
                <button onClick={() => setIdx((idx - 1 + slides.length) % slides.length)}>
                    ← Previous
                </button>
                <button onClick={() => setIdx((idx + 1) % slides.length)}>
                    Next →
                </button>
            </div>
        </div>
    )
}
