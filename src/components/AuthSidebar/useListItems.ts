import { useState } from "react"

export const useListItems = () => {
    const [open, setOpen] = useState(false)
    const menuItems = [
        {
            id: 'dashboard',
            name: 'Dashboard',
            icon: 'home',
            to: '/dashboard'
        },
        {
            id: 'profile',
            name: 'Profile',
            icon: 'user',
            to: '/profile'
        },
        {
            id: 'video_stream',
            name: 'Video Stream',
            icon: 'video',
            to: '/video_stream'
        },
        {
            id: 'tests',
            name: 'Tests',
            icon: 'test',
            to: '/test'
        }
    ]

    return {
        open,
        setOpen,
        menuItems: menuItems
    }
}