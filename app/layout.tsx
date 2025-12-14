import './globals.css'
import type { Metadata } from 'next'
import { Footer } from '@/components/Footer'
import { AuthProvider } from '@/components/auth/NewAuthContext'
import { ClientProviders } from '@/components/ClientProviders'
import React from 'react'
import { Navigation } from '@/components/Navigation'

export const metadata: Metadata = {
  title: 'TheraTreat - Health & Wellness Platform',
  description: 'Your comprehensive health and wellness platform',
  icons: {
    icon: ['/favicon.ico', '/favicon.png', '/logo.png'],
    shortcut: ['/favicon.ico', '/favicon.png', '/logo.png'],
    apple: ['/apple-touch-icon.png', '/logo.png']
  }
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <ClientProviders>
            {process.env.AUTH_DEV_BYPASS === '1' && process.env.NODE_ENV !== 'production' && (
              <div style={{position:'fixed',top:0,left:0,right:0,zIndex:50,background:'#b45309',color:'#fff',padding:'6px 12px',fontSize:12,display:'flex',justifyContent:'space-between',alignItems:'center',boxShadow:'0 2px 4px rgba(0,0,0,0.15)'}}>
                <span><strong>Auth Dev Bypass</strong> active – NOT for production. Remove AUTH_DEV_BYPASS=1 to enforce real auth.</span>
              </div>
            )}
            <div style={{paddingTop: process.env.AUTH_DEV_BYPASS === '1' && process.env.NODE_ENV !== 'production' ? 34 : 0}}>
              <Navigation />
              {children}
              <Footer/>
            </div>
          </ClientProviders>
        </AuthProvider>
      </body>
    </html>
  )
}
