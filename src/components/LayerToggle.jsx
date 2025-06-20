// src/components/LayerToggle.jsx
import React from 'react'

export default function LayerToggle({ layers, toggleLayer }) {
    return (
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 1000, background: '#fff', padding: '10px', borderRadius: 8 }}>
            {Object.keys(layers).map(key => (
                <div key={key}>
                    <label>
                        <input
                            type="checkbox"
                            checked={layers[key].visible}
                            onChange={() => toggleLayer(key)}
                        />
                        {key}
                    </label>
                </div>
            ))}
        </div>
    )
}
