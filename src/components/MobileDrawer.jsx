import React from 'react'
import { Drawer, IconButton } from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

export default function MobileDrawer({ children }) {
    const [open, setOpen] = React.useState(false)
    return (
        <>
            <IconButton onClick={() => setOpen(true)} style={{ position: 'absolute', top: 10, left: 10, zIndex: 2000 }}>
                <MenuIcon />
            </IconButton>
            <Drawer anchor="left" open={open} onClose={() => setOpen(false)}>
                <div style={{ width: 250, padding: 20 }}>
                    {children}
                </div>
            </Drawer>
        </>
    )
}
