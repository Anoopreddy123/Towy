import type { Metadata } from "next"
import { Inter } from 'next/font/google'
import "./globals.css"
import Navbar from "@/components/navbar"
import { AuthProvider } from "@/contexts/AuthContext"
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TOWY - Fast & Reliable Towing Services",
  description: "Professional towing services in Long Beach. Available 24/7 for emergency towing, roadside assistance, and vehicle recovery.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
     
      <body className={inter.className}>
        <AuthProvider>
          <Navbar />
          {children}
        </AuthProvider>
        <Toaster />
      </body>
    </html>
  )
}

