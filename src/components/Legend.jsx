import React, { useEffect, useState } from 'react'
import './styles/Legend.css'

const Legend = ({
                    toggleReservation,
                    toggleAncestral,
                    reservationVisible,
                    ancestralVisible
                }) => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        setTimeout(() => setVisible(true), 600)
    }, [])

    const choroplethData = [
        { label: '0–10%', color: '#f7fbff' },
        { label: '10–20%', color: '#deebf7' },
        { label: '20–30%', color: '#9ecae1' },
        { label: '30–40%', color: '#3182bd' },
        { label: '40–50%+', color: '#08519c' }
    ]

    return (
        <div className={`legend-container${visible ? ' visible' : ''}`}>
            <h4>Legend & Layers</h4>

            <section className="legend-section">
                <strong>AI/AN %</strong>
                <div className="swatches">
                    {choroplethData.map((d, i) => (
                        <div key={i} className="swatch-row">
                            <div className="color-box" style={{ background: d.color }} />
                            <div className="label">{d.label}</div>
                        </div>
                    ))}
                </div>
            </section>

            <section className="legend-section">
                <button onClick={toggleReservation} className="layer-toggle">
                    {reservationVisible ? 'Hide' : 'Show'} Reservations
                </button>
                <button onClick={toggleAncestral} className="layer-toggle">
                    {ancestralVisible ? 'Hide' : 'Show'} Ancestral Lands
                </button>
            </section>
        </div>
    )
}

export default Legend
