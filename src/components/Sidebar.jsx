import React from 'react'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

const Sidebar = ({ layerVisibility, setLayerVisibility }) => {
  const handleChange = (event) => {
    const { name, checked } = event.target
    setLayerVisibility(prev => ({ ...prev, [name]: checked }))
  }

  return (
    <Drawer variant="permanent" anchor="left">
      <Box sx={{ width: 260, padding: 2 }}>
        <Typography variant="h6" gutterBottom>Data Layers</Typography>
        <FormGroup>
          <FormControlLabel control={<Checkbox name="ai_an" defaultChecked disabled />} label="AI/AN Population" />
          <FormControlLabel control={<Checkbox name="reservations" onChange={handleChange} />} label="Reservations" />
          <FormControlLabel control={<Checkbox name="tribalLands" onChange={handleChange} />} label="Ancestral Lands" />
        </FormGroup>
      </Box>
    </Drawer>
  )
}

export default Sidebar
