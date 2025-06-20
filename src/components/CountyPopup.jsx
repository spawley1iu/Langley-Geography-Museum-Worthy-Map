import React from 'react'

const CountyPopup = ({ feature }) => {
    if (!feature) return null

    const properties = feature.getProperties()
    const { NAME, description, image, audio, video, website } = properties

    return (
        <div style={{ maxWidth: 320 }}>
            <h3 style={{ marginTop: 0 }}>{NAME || 'Unnamed County'}</h3>

            {image ? (
                <img
                    src={image}
                    alt={NAME}
                    style={{
                        width: '100%',
                        height: 'auto',
                        marginBottom: 8,
                        borderRadius: 4,
                        objectFit: 'cover'
                    }}
                />
            ) : (
                <p style={{ fontStyle: 'italic' }}>No image available</p>
            )}

            {description && <p>{description}</p>}

            {audio ? (
                <audio controls style={{ width: '100%' }}>
                    <source src={audio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            ) : (
                <p style={{ fontStyle: 'italic' }}>No audio narration</p>
            )}

            {video ? (
                <video controls width="100%" style={{ marginTop: 10, borderRadius: 4 }}>
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video element.
                </video>
            ) : (
                <p style={{ fontStyle: 'italic' }}>No video content</p>
            )}

            {website && (
                <p style={{ marginTop: 10 }}>
                    <a href={website} target="_blank" rel="noopener noreferrer">
                        Learn more →
                    </a>
                </p>
            )}
        </div>
    )
}

export default CountyPopup
