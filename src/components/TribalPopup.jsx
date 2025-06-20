import React from 'react'

const TribalPopup = ({ properties }) => (
    <div style={{ maxWidth: 300 }}>
        <h3>{properties.name}</h3>
        {properties.image && <img src={`/media/${properties.image}`} alt="" style={{ width: '100%' }} />}
        {properties.audio && (
            <audio controls style={{ width: '100%' }}>
                <source src={`/media/${properties.audio}`} type="audio/mpeg" />
            </audio>
        )}
        {properties.video && (
            <video controls width="100%">
                <source src={`/media/${properties.video}`} type="video/mp4" />
            </video>
        )}
        <p>{properties.description}</p>
    </div>
)

export default TribalPopup
