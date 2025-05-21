import type { Metadata } from 'next'
import './globals.css'
import { Play }  from 'next/font/google'

const play = Play({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-play',
})

export const metadata: Metadata = {
  title: 'PhonkItUp',
  description: 'The best phonk music app',
  generator: 'v0.dev',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={play.variable}>
      <body className="font-anta">{children}</body>
    </html>
  )
}
