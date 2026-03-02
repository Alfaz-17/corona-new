import React from "react"
import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { Header } from "@/components/boty/header"
import { Footer } from "@/components/boty/footer"
import { FloatingWhatsappButton } from "@/components/common/floating-whatsapp-button"
import { AuthProvider } from "@/components/contexts/auth-context"
import StructuredData from "@/components/seo/structured-data"

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans',
  weight: ['300', '400', '500', '600']
});

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700']
});

export const metadata: Metadata = {
  metadataBase: new URL('https://coronamarineparts.com'),
  title: {
    default: 'Corona Marine Parts | Marine Spare Parts & Marine Services Supplier',
    template: '%s | Corona Marine Parts'
  },
  description: 'Leading global supplier of premium marine spare parts, automation systems, and ship machinery components from Alang Shipyard. Reliable maritime solutions with worldwide shipping.',
  keywords: ['marine automation', 'ship spare parts', 'alang shipyard', 'marine engineering', 'vessel automation', 'ship machinery spares', 'marine electricals', 'refurbished marine parts'],
  authors: [{ name: 'Corona Marine Parts' }],
  creator: 'Corona Marine Parts',
  publisher: 'Corona Marine Parts',
  alternates: {
    canonical: '/',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://coronamarineparts.com',
    siteName: 'Corona Marine Parts',
    title: 'Corona Marine Parts | Global Marine Spare Parts Supplier',
    description: 'Leading supplier of marine automation, engine spares, and ship machinery from Alang Shipyard.',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Corona Marine Parts - Marine Solutions',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Corona Marine Parts | Marine Spare Parts',
    description: 'Trusted supplier of marine automation and ship spare parts worldwide.',
    images: ['/og-image.png'],
    creator: '@coronamarine',
  },
  icons: {
    icon: [
      { url: '/favicon.ico' },
      { url: '/logo.png', type: 'image/png' },
    ],
    apple: [
      { url: '/logo.png' },
    ],
  },
}

export const viewport: Viewport = {
  themeColor: '#0E2A47',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfairDisplay.variable} font-sans antialiased bg-background text-foreground`}>
          <StructuredData />
          <AuthProvider>
            <Header />
            <div className="flex flex-col min-h-screen">
              {children}
            </div>
            <Footer />
            <FloatingWhatsappButton />
          </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
