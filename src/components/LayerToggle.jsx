import React from 'react'

export default function LayerToggle({ layers, toggleLayer }) {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.keys(layers).map(key => (
                <label key={key} style={{ fontSize: 14 }}>
                    <input
                        type="checkbox"
                        checked={layers[key].visible}
                        onChange={() => toggleLayer(key)}
                        style={{ marginRight: 8 }}
                    />
                    {key}
                </label>
            ))}
        </div>
    )
}
