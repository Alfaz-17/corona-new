import React from "react"
import type { Metadata, Viewport } from 'next'
import Script from 'next/script'
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
  weight: ['400', '500', '700'],
  display: 'swap'
});

const playfairDisplay = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair',
  weight: ['400', '700'],
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: new URL('https://coronamarineparts.com'),
  title: {
    default: 'Corona Marine Parts | Marine Spare Parts & Marine Services Supplier',
    template: '%s | Corona Marine Parts'
  },
  description: 'Leading global supplier of marine spare parts, ship automation systems, engine room machinery, and marine electronics from Alang Shipyard. Buy certified marine equipment with worldwide shipping at best prices.',
  keywords: [
    'marine spare parts', 'ship spare parts', 'marine automation', 'ship engine parts',
    'marine electronics', 'Alang shipyard parts', 'marine equipment supplier',
    'ship machinery spares', 'marine electricals', 'refurbished marine parts',
    'buy marine parts online', 'marine parts India', 'ship breaking yard parts',
    'marine generator parts', 'marine pump supplier', 'Corona Marine Parts',
  ],
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
        url: '/hero-bg.webp',
        width: 1200,
        height: 630,
        alt: 'Corona Marine Parts - Marine Spare Parts & Ship Equipment Supplier from Alang Shipyard, India',
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
  verification: {
    google: 'xRtr26Gua2UzdG2C5sUomRplFcKxgCZC1qMW-yKnWmE',
  },
}

export const viewport: Viewport = {
  themeColor: '#0E2A47',
}

import { AiChatWidget } from "@/components/chat/ai-chat-widget"

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const gaMeasurementId = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfairDisplay.variable} font-sans antialiased bg-background text-foreground`}>
          {gaMeasurementId && (
            <>
              <Script
                src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
                strategy="afterInteractive"
              />
              <Script id="ga4-init" strategy="afterInteractive">
                {`
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', ${JSON.stringify(gaMeasurementId)});
                `}
              </Script>
            </>
          )}
          <StructuredData />
          <AuthProvider>
            <Header />
            <div className="flex flex-col min-h-screen">
              {children}
            </div>
            <Footer />
            <FloatingWhatsappButton />
            <AiChatWidget />
          </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
