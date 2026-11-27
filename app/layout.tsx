import { Analytics } from '@vercel/analytics/next'
import type { Metadata, Viewport } from 'next'
import { Inter, Noto_Sans_Tamil } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' })
const tamil = Noto_Sans_Tamil({
  subsets: ['tamil'],
  weight: ['400', '600', '700'],
  variable: '--font-tamil',
  display: 'swap',
})

export const metadata: Metadata = {
  title: 'Oli — Source of Illumination | ஒளி — பிரகாசத்தின் மூலம்',
  description:
    'Oli is a bilingual English and Tamil voice-first companion for blind and visually impaired people in Chennai and Tamil Nadu: where am I, what is ahead, read text, and emergency SOS.',
  generator: 'v0.app',
  applicationName: 'Oli',
  icons: {
    icon: [
      { url: '/icon-light-32x32.png', media: '(prefers-color-scheme: light)' },
      { url: '/icon-dark-32x32.png', media: '(prefers-color-scheme: dark)' },
      { url: '/icon.svg', type: 'image/svg+xml' },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  colorScheme: 'dark',
  themeColor: '#0c0a09',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${tamil.variable} bg-background`}>
      <body className="antialiased">
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
