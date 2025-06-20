import React, { useEffect, useState } from 'react'
import { Paper, IconButton, Typography } from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import MenuIcon from '@mui/icons-material/Menu'
import '../css/legend.css'

const legendItems = [
    { label: 'AI/AN Population > 50%', color: '#8e44ad' },
    { label: 'Poverty Rate > 30%', color: '#e67e22' },
    { label: 'Median Income < $35k', color: '#3498db' },
    { label: 'High School Diploma < 70%', color: '#c0392b' },
    { label: 'Reservation Boundary', color: '#d32f2f', outline: true },
    { label: 'Ancestral Land', color: '#00897b', transparent: true }
]

const Legend = () => {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const timer = setTimeout(() => setVisible(true), 500)
        return () => clearTimeout(timer)
    }, [])

    return (
        <>
            {!visible && (
                <IconButton
                    onClick={() => setVisible(true)}
                    style={{
                        position: 'absolute',
                        bottom: 20,
                        right: 20,
                        zIndex: 999,
                        background: 'white',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.3)'
                    }}
                >
                    <MenuIcon />
                </IconButton>
            )}

            <Paper
                className={`legend-container ${!visible ? 'hidden' : ''}`}
                elevation={4}
                style={{ position: 'absolute', bottom: 20, right: 20 }}
            >
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="subtitle1" fontWeight={600}>
                        Map Legend
                    </Typography>
                    <IconButton size="small" onClick={() => setVisible(false)}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                </div>

                <div>
                    {legendItems.map((item, index) => (
                        <div key={index} style={{ marginTop: 6 }}>
              <span
                  className="legend-color-box"
                  style={{
                      backgroundColor: item.transparent
                          ? 'rgba(0,137,123,0.2)'
                          : item.color,
                      border:
                          item.outline || item.transparent
                              ? `2px solid ${item.color}`
                              : '1px solid #ccc'
                  }}
              ></span>
                            {item.label}
                        </div>
                    ))}
                </div>
            </Paper>
        </>
    )
}

export default Legend
