import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { Navigation } from "@/components/navigation"
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from '@/components/ui/sonner';


const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "StackIt - Q&A Forum Platform",
  description: "A minimal question-and-answer platform for collaborative learning",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Navigation />
          <main className="min-h-screen bg-gray-50">{children}</main>
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  )
}
