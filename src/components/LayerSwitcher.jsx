// src/components/LayerSwitcher.jsx
import React, { useState } from 'react';

const layers = ['ai_an_percent', 'poverty', 'income'];

export default function LayerSwitcher({ onChange }) {
    const [active, setActive] = useState(layers[0]);

    const handleChange = (layer) => {
        setActive(layer);
        onChange(layer);
    };

    return (
        <div className="legend-container">
            <h4>Data Layers</h4>
            {layers.map(l => (
                <button
                    key={l}
                    className={`legend-button ${active === l ? 'active' : ''}`}
                    onClick={() => handleChange(l)}
                >
                    {l.replace('_', ' ').toUpperCase()}
                </button>
            ))}
        </div>
    );
}
