import React from 'react'
import './styles/LayerToggle.css'

const LayerToggle = ({ layers, toggleLayer }) => {
    return (
        <div className="layer-toggle-container">
            <h4>Data Layers</h4>
            <ul className="layer-toggle-list">
                {Object.entries(layers).map(([label, { visible }]) => (
                    <li key={label}>
                        <label>
                            <input
                                type="checkbox"
                                checked={visible}
                                onChange={() => toggleLayer(label)}
                            />
                            {label}
                        </label>
                    </li>
                ))}
            </ul>
        </div>
    )
}

export default LayerToggle
