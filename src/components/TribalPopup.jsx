import React from 'react'

const TribalPopup = ({ properties }) => {
    if (!properties) return null

    const {
        name,
        description,
        image,
        audio,
        video,
        website
    } = properties

    return (
        <div style={{ maxWidth: 300 }}>
            <h3 style={{ marginTop: 0 }}>{name}</h3>

            {image && (
                <img
                    src={image.startsWith('http') ? image : `/media/${image}`}
                    alt={name}
                    style={{ width: '100%', height: 'auto', marginBottom: 8 }}
                />
            )}

            {description && <p>{description}</p>}

            {audio && (
                <audio controls style={{ width: '100%' }}>
                    <source
                        src={audio.startsWith('http') ? audio : `/media/${audio}`}
                        type="audio/mpeg"
                    />
                    Your browser does not support the audio element.
                </audio>
            )}

            {video && (
                <video controls width="100%">
                    <source
                        src={video.startsWith('http') ? video : `/media/${video}`}
                        type="video/mp4"
                    />
                    Your browser does not support the video element.
                </video>
            )}

            {website && (
                <p style={{ marginTop: 8 }}>
                    <a href={website} target="_blank" rel="noopener noreferrer">
                        Learn more →
                    </a>
                </p>
            )}
        </div>
    )
}

export default TribalPopup
