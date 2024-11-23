'use client'

import './globals.css'
import { AuthProvider } from '../context/AuthContext'
import { NavbarWrapper } from '../components/NavbarWrapper'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <title>HA TICKET</title>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Quicksand:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
      </head>
      <body className="font-quicksand">
        <AuthProvider>
          <NavbarWrapper />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
