import React from 'react'
import useMediaQuery from '@mui/material/useMediaQuery'
import Drawer from '@mui/material/Drawer'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import FormGroup from '@mui/material/FormGroup'
import FormControlLabel from '@mui/material/FormControlLabel'
import Checkbox from '@mui/material/Checkbox'

const Sidebar = ({ layerVisibility, setLayerVisibility }) => {
  const isMobile = useMediaQuery('(max-width:600px)')

  const handleChange = (event) => {
    const { name, checked } = event.target
    setLayerVisibility(prev => ({ ...prev, [name]: checked }))
  }

  return (
    <Drawer
      anchor={isMobile ? 'bottom' : 'left'}
      variant="permanent"
      sx={{
        width: isMobile ? '100%' : 260,
        height: isMobile ? 140 : '100%',
        '& .MuiDrawer-paper': {
          width: isMobile ? '100%' : 260,
          height: isMobile ? 140 : '100%'
        }
      }}
    >
      <Box sx={{ padding: 2 }}>
        <Typography variant="subtitle1">Data Layers</Typography>
        <FormGroup row={isMobile}>
          <FormControlLabel control={<Checkbox name="reservations" onChange={handleChange} />} label="Reservations" />
          <FormControlLabel control={<Checkbox name="tribalLands" onChange={handleChange} />} label="Ancestral Lands" />
        </FormGroup>
      </Box>
    </Drawer>
  )
}

export default Sidebar
