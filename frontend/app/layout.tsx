// app/layout.tsx
import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import { JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { QueryProvider } from '@/lib/providers/QueryProvider'
import { Toaster } from 'sonner'

const geist = Geist({ 
  subsets: ['latin'],
  variable: '--font-geist',
  display: 'swap',
})

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-jetbrains',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
})

export const metadata: Metadata = {
  title: 'FinTrack - Personal Finance Management',
  description: 'Track expenses, manage budgets, and achieve your financial goals',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${geist.variable} ${jetbrainsMono.variable}`}>
      <body className={geist.className}>
        <QueryProvider>
          {children}
          <Toaster position="top-right" richColors theme="dark" />
        </QueryProvider>
      </body>
    </html>
  )
}
