import React from 'react'

const TribalPopup = ({ properties }) => {
    if (!properties) return null

    const { name, description, image, audio, video, website, tribalAssets = [] } = properties

    return (
        <div style={{ maxWidth: 320 }}>
            <h3 style={{ marginTop: 0 }}>{name}</h3>

            {image && (
                <img
                    src={image}
                    alt={name}
                    style={{ width: '100%', height: 'auto', marginBottom: 8 }}
                />
            )}

            {description && <p>{description}</p>}

            {audio && (
                <audio controls style={{ width: '100%', marginBottom: 8 }}>
                    <source src={audio} type="audio/mpeg" />
                    Your browser does not support the audio element.
                </audio>
            )}

            {video && (
                <video controls width="100%" style={{ marginBottom: 8 }}>
                    <source src={video} type="video/mp4" />
                    Your browser does not support the video tag.
                </video>
            )}

            {website && (
                <p style={{ marginTop: 8 }}>
                    <a href={website} target="_blank" rel="noopener noreferrer">
                        Learn more →
                    </a>
                </p>
            )}

            {tribalAssets.length > 0 && (
                <div>
                    <h4>Tribal Assets</h4>
                    <ul style={{ paddingLeft: 16 }}>
                        {tribalAssets.map((asset, idx) => (
                            <li key={idx}>
                                <strong>{asset.type}:</strong>{' '}
                                <a href={asset.url} target="_blank" rel="noopener noreferrer">
                                    {asset.title}
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    )
}

export default TribalPopup
