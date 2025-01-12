"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import { Button } from "./ui/button"
import { useRouter } from "next/navigation"

interface User {
  name: string;
  role: string;
}

export function MainNav() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const userData = localStorage.getItem('user')
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    localStorage.removeItem('userRole')
    window.location.href = '/'
  }

  if (!mounted) return null

  return (
    <nav className="flex items-center space-x-6">
      <Link 
        href="/" 
        className="text-black text-sm font-medium transition-colors hover:text-green-600"
      >
        Home
      </Link>

      {user ? (
        <>
          <Link 
            href={user.role === 'provider' ? '/provider/dashboard' : '/dashboard'}
            className="text-black text-sm font-medium transition-colors hover:text-green-600"
          >
            Dashboard
          </Link>
          <span className="text-black text-sm font-medium">Hi, {user.name}</span>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            className="text-red-600 hover:text-red-700"
          >
            Logout
          </Button>
        </>
      ) : (
        <>
          <Link 
            href="/login" 
            className="text-black text-sm font-medium transition-colors hover:text-green-600"
          >
            Login
          </Link>
          <Link 
            href="/signup"
            className="text-black text-sm font-medium transition-colors hover:text-green-600"
          >
            Sign Up
          </Link>
        </>
      )}
    </nav>
  )
} 