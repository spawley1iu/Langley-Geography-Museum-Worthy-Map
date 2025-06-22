// src/components/Legend.jsx
import React from 'react'
export default function Legend({
                                   toggleReservation,
                                   toggleAncestral,
                                   reservationVisible,
                                   ancestralVisible
                               }) {
    return (
        <div className="legend-container">
            <div className="legend-item">
                <label>
                    <input
                        type="checkbox"
                        checked={reservationVisible}
                        onChange={toggleReservation}
                    />
                    Reservations
                </label>
            </div>
            <div className="legend-item">
                <label>
                    <input
                        type="checkbox"
                        checked={ancestralVisible}
                        onChange={toggleAncestral}
                    />
                    Ancestral Lands
                </label>
            </div>
        </div>
    )
}
