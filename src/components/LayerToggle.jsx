// src/components/LayerToggle.jsx
import React from 'react'
export default function LayerToggle({ layerGroups, toggleLayer }) {
    return (
        <div className="layer-toggle-container">
            {Object.entries(layerGroups).map(([groupName, layers]) => (
                <div key={groupName} className="layer-group">
                    <h4>{groupName}</h4>
                    {Object.entries(layers).map(([layerName, { layer, visible }]) => (
                        <label key={layerName} className="layer-toggle-item">
                            <input
                                type="checkbox"
                                checked={visible}
                                onChange={() => toggleLayer(groupName, layerName)}
                            />
                            {layerName}
                        </label>
                    ))}
                </div>
            ))}
        </div>
    )
}
