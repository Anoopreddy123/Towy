'use client';

import Link from "next/link"
import { Button } from "./ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { authService } from "@/services/api"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { user, setUser, isLoading } = useAuth()
  const router = useRouter()

  const handleLogout = () => {
    authService.logout()
    setUser(null)
    router.push('/')
  }

  if (isLoading) {
    return null;
  }

  return (
    <nav className="fixed w-full bg-white z-50 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="text-2xl font-bold text-white-600">
            TOWY
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/" className="hover:text-green-600">Home</Link>
            <Link href="/about" className="hover:text-green-600">About</Link>
            {user && (
                <>
                    <Link 
                        href={user.role === 'provider' ? '/provider/dashboard' : '/dashboard'} 
                        className="hover:text-green-600"
                    >
                        Dashboard
                    </Link>
                    {user.role === 'customer' && (
                        <Link 
                            href="/request-service" 
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md"
                        >
                            Request Service
                        </Link>
                    )}
                </>
            )}
            <Link href="/contact" className="hover:text-green-600">Contact</Link>
            <div className="ml-4 flex items-center gap-4">
              {user ? (
                <div className="flex items-center gap-4">
                  <span className="font-medium">Welcome, {user.name}!</span>
                  <Button 
                    variant="outline" 
                    onClick={handleLogout}
                    className="text-red-600 hover:text-red-700"
                  >
                    Logout
                  </Button>
                </div>
              ) : (
                <>
                  <Button variant="outline" asChild>
                    <Link href="/login">Login</Link>
                  </Button>
                  <Button asChild className="bg-green-600 hover:bg-green-700">
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}