'use client'

import Link from 'next/link'
import { useAuth } from '../context/AuthContext'
import { useRouter } from 'next/navigation'
import { Ticket, LogOut, UserCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useState } from 'react'

export default function Navbar({ isSidebarOpen, setIsSidebarOpen }: { 
  isSidebarOpen: boolean;
  setIsSidebarOpen: (value: boolean) => void;
}) {
  const { user, logout } = useAuth()
  const router = useRouter()

  return (
    <header className="fixed top-0 left-0 right-0 bg-black z-50 shadow-lg">
      <div className="w-full px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo et titre */}
          <Link 
            href="/"
            className="flex items-center gap-2.5 transition-colors"
          >
            <Ticket className="w-[30px] h-[30px] lg:w-[33px] lg:h-[33px] text-orange-500" />
            <span className="font-bold text-[19px] lg:text-[22px] bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
              HA Ticket
            </span>
          </Link>

          <div className="flex items-center gap-4">
            {/* Bouton déconnexion desktop */}
            <div className="hidden lg:flex items-center">
              {user && (
                <button
                  onClick={logout}
                  className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-orange-500 transition-colors font-quicksand"
                >
                  <LogOut className="w-5 h-5" />
                  <span className="text-sm font-medium">Déconnexion</span>
                </button>
              )}
            </div>

            {/* Bouton menu mobile - uniquement affiché si l'utilisateur est connecté */}
            {user && (
              <button 
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden flex flex-col justify-center gap-1.5 w-6 group"
              >
                <span className={`w-6 h-0.5 bg-orange-500 rounded-full transition-all duration-300 ${
                  isSidebarOpen ? 'rotate-45 translate-y-2' : ''
                }`}></span>
                <span className={`w-6 h-0.5 bg-orange-500 rounded-full transition-all duration-300 ${
                  isSidebarOpen ? 'opacity-0' : ''
                }`}></span>
                <span className={`w-6 h-0.5 bg-orange-500 rounded-full transition-all duration-300 ${
                  isSidebarOpen ? '-rotate-45 -translate-y-2' : ''
                }`}></span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}