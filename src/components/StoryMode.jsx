// src/components/StoryMode.jsx
import React, { useState, useEffect } from 'react';
import storySlides from '../data/story-data.json';
// 1. Correctly import CSS Modules as an object (e.g., 'styles')
//    This assumes 'StoryMode.module.css' is in the same folder.
import styles from './StoryMode.module.css';
import { fromLonLat } from 'ol/proj'; // Assuming you have 'ol' installed

export default function StoryMode({ map, highlightSource, ancestralLayer, reservationsLayer }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const slide = storySlides[currentIndex];

    // whenever slide changes, clear highlight & zoom to the actual feature
    useEffect(() => {
        if (!map || !highlightSource || !slide) return;
        highlightSource.clear();

        // Note: 'ancestralLayer' and 'reservationsLayer' were used here
        // but not passed as props. I've added them to the function
        // signature above to make this dependency clear.
        let source;
        if (slide.type === 'tribe') {
            source = map
                .getLayers()
                .getArray()
                .find(l => l.getSource()?.getUrl?.()?.includes('tribal-markers'))
                ?.getSource(); // Optional chaining for safety
        } else if (slide.type === 'land') {
            source = map
                .getLayers()
                .getArray()
                .find(l => l === ancestralLayer)
                ?.getSource();
        } else if (slide.type === 'reservation') {
            source = map
                .getLayers()
                .getArray()
                .find(l => l === reservationsLayer)
                ?.getSource();
        }

        if (!source) return;

        // Using a function with getFeatures() is safer in case features aren't loaded yet
        const findFeature = () => {
            const feat = source
                .getFeatures()
                .find(f =>
                    slide.type === 'tribe'
                        ? f.get('tribeName') === slide.featureName
                        : f.get('name') === slide.featureName
                );

            if (!feat) return;

            // highlight it
            highlightSource.addFeature(feat.clone());

            // pan+zoom to its geometry from 'ol/proj'
            const coords = feat.getGeometry().getCoordinates();
            map.getView().animate({ center: fromLonLat(coords), zoom: slide.zoom || 6, duration: 600 });
        };

        // If the source is still loading, listen for it to finish
        if (source.getState() === 'loading') {
            source.once('change', findFeature);
        } else {
            findFeature();
        }

    }, [currentIndex, map, highlightSource, slide, ancestralLayer, reservationsLayer]);

    if (!slide) return null;

    return (
        // 2. Use the 'styles' object to apply classes
        <div className={styles.storyModePanel}>
            <h2>{slide.title}</h2>
            {slide.image && <img src={slide.image} alt={slide.title} className={styles.storyImage} />}
            <p>{slide.description}</p>

            {slide.audio && (
                <audio controls className={styles.storyAudio}>
                    <source src={slide.audio} type="audio/mpeg" />
                </audio>
            )}

            {slide.videoUrl && (
                <div className={styles.storyVideo}>
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

            <div className={styles.storyControls}>
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
    );
}