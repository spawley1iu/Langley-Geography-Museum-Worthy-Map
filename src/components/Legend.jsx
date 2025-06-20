import React from 'react'
import './Legend.css'

const swatches = [
    { color: '#f2f0f7', label: '0–10%' },
    { color: '#cbc9e2', label: '10–20%' },
    { color: '#9e9ac8', label: '20–30%' },
    { color: '#756bb1', label: '30–40%' },
    { color: '#54278f', label: '40%+' }
]

export default function Legend({ toggleReservation, toggleAncestral, reservationVisible, ancestralVisible }) {
    return (
        <div className="legend-container">
            <h3>Legend</h3>
            <div className="legend-section">
                <div className="swatches">
                    {swatches.map((s, i) => (
                        <div key={i} className="swatch-row">
                            <div className="color-box" style={{ backgroundColor: s.color }}></div>
                            <span className="label">{s.label}</span>
                        </div>
                    ))}
                </div>
            </div>
            <div className="legend-section">
                <button className="layer-toggle" onClick={toggleReservation}>
                    {reservationVisible ? 'Hide' : 'Show'} Reservations
                </button>
                <button className="layer-toggle" onClick={toggleAncestral}>
                    {ancestralVisible ? 'Hide' : 'Show'} Ancestral Lands
                </button>
            </div>
        </div>
    )
}
