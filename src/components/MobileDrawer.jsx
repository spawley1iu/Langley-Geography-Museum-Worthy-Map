import React, { useState } from 'react'
import { Drawer, IconButton, useMediaQuery } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

export default function MobileDrawer({ children }) {
    const [open, setOpen] = useState(false)
    const isMobile = useMediaQuery('(max-width: 768px)')

    return isMobile ? (
        <>
            <IconButton
                onClick={() => setOpen(true)}
                style={{
                    position: 'absolute',
                    top: 10,
                    left: 10,
                    zIndex: 2000,
                    backgroundColor: 'white'
                }}
            >
                <MenuIcon />
            </IconButton>
            <Drawer
                anchor="left"
                open={open}
                onClose={() => setOpen(false)}
                PaperProps={{
                    style: { width: 260, padding: '1rem' }
                }}
            >
                {children}
            </Drawer>
        </>
    ) : (
        <div style={{
            position: 'absolute',
            top: 10,
            left: 10,
            zIndex: 2000,
            backgroundColor: 'white',
            borderRadius: 8,
            padding: '12px',
            boxShadow: '0 2px 6px rgba(0,0,0,0.2)'
        }}>
            {children}
        </div>
    )
}
