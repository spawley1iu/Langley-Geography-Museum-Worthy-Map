import React, { useEffect, useState } from 'react'
import Box from '@mui/material/Box'
import Typography from '@mui/material/Typography'
import Slide from '@mui/material/Slide'

const Legend = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setOpen(true), 1000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <Slide direction="up" in={open} mountOnEnter unmountOnExit>
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 280,
          background: 'white',
          padding: 2,
          borderRadius: 1,
          boxShadow: 4,
          zIndex: 1000
        }}
      >
        <Typography variant="body2" fontWeight="bold">Legend</Typography>
        <ul style={{ paddingLeft: 16, margin: 0, fontSize: 13 }}>
          <li><span style={{ color: '#084081' }}>■■</span> &gt; 50% AI/AN</li>
          <li><span style={{ color: '#2b8cbe' }}>■■</span> &gt; 20%</li>
          <li><span style={{ color: '#7bccc4' }}>■■</span> &gt; 10%</li>
          <li><span style={{ color: '#bae4bc' }}>■■</span> &gt; 1%</li>
        </ul>
      </Box>
    </Slide>
  )
}

export default Legend
