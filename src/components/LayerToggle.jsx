import React from 'react'
import { FormControlLabel, Switch, Paper } from '@mui/material'

const LayerToggle = ({ toggles, onChange }) => {
    return (
        <Paper elevation={3} sx={{
            position: 'absolute',
            top: 10,
            left: 10,
            padding: 2,
            zIndex: 1000
        }}>
            <FormControlLabel
                control={<Switch checked={toggles.reservations} onChange={() => onChange('reservations')} />}
                label="Reservations"
            />
            <FormControlLabel
                control={<Switch checked={toggles.ancestral} onChange={() => onChange('ancestral')} />}
                label="Ancestral Lands"
            />
        </Paper>
    )
}

export default LayerToggle
