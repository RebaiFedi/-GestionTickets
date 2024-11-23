'use client'

import { usePathname } from 'next/navigation'
import Navbar from './Navbar'
import { useState } from 'react'

export function NavbarWrapper() {
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  
  // Ne pas afficher la navbar sur la page de login (racine '/')
  if (pathname === '/') {
    return null
  }

  return (
    <Navbar 
      isSidebarOpen={isSidebarOpen} 
      setIsSidebarOpen={setIsSidebarOpen} 
    />
  )
} 