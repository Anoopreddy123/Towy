'use client';

import Link from "next/link"
import { Button } from "./ui/button"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { UserCircle, Menu, X } from "lucide-react"
import { useState } from "react"

export default function Navbar() {
    const { user, isLoading, logout } = useAuth()
    const router = useRouter()
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

    const handleLogout = () => {
        logout()
        router.push('/')
        setIsMobileMenuOpen(false)
    }

    if (isLoading) return null;

    return (
        <nav className="fixed w-full bg-white z-50 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="text-xl md:text-2xl font-bold text-green-600">
                        TOWY
                    </Link>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-4">
                        <Link href="/" className="hover:text-green-600 transition-colors">Home</Link>
                        <Link href="/about" className="hover:text-green-600 transition-colors">About</Link>
                        <Link href="/contact" className="hover:text-green-600 transition-colors">Contact</Link>
                        
                        {user && (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center gap-2">
                                            <UserCircle className="h-5 w-5" />
                                            <span className="hidden lg:inline">
                                                {user.businessName || user.name || user.email}
                                            </span>
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => router.push(
                                            user.role === 'provider' ? '/provider/dashboard' : '/dashboard'
                                        )}>
                                            Dashboard
                                        </DropdownMenuItem>
                                        {user.role === 'customer' && (
                                            <DropdownMenuItem onClick={() => router.push('/request-service')}>
                                                Request Service
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuItem onClick={() => router.push('/profile')}>
                                            Profile
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={handleLogout}>
                                            Logout
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </>
                        )}

                        {!user && (
                            <div className="flex items-center gap-4">
                                <Button variant="ghost" onClick={() => router.push('/login')}>
                                    Login
                                </Button>
                                <Button 
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => router.push('/signup')}
                                >
                                    Sign Up
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2"
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                    >
                        {isMobileMenuOpen ? (
                            <X className="h-6 w-6" />
                        ) : (
                            <Menu className="h-6 w-6" />
                        )}
                    </button>
                </div>

                {/* Mobile Menu */}
                {isMobileMenuOpen && (
                    <div className="md:hidden bg-white border-t border-gray-200 py-4">
                        <div className="flex flex-col space-y-4 px-4">
                            <Link 
                                href="/" 
                                className="hover:text-green-600 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Home
                            </Link>
                            <Link 
                                href="/about" 
                                className="hover:text-green-600 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                About
                            </Link>
                            <Link 
                                href="/contact" 
                                className="hover:text-green-600 transition-colors"
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                Contact
                            </Link>
                            
                            {user && (
                                <>
                                    <Button 
                                        variant="ghost" 
                                        className="justify-start"
                                        onClick={() => {
                                            router.push(user.role === 'provider' ? '/provider/dashboard' : '/dashboard')
                                            setIsMobileMenuOpen(false)
                                        }}
                                    >
                                        Dashboard
                                    </Button>
                                    {user.role === 'customer' && (
                                        <Button 
                                            variant="ghost" 
                                            className="justify-start"
                                            onClick={() => {
                                                router.push('/request-service')
                                                setIsMobileMenuOpen(false)
                                            }}
                                        >
                                            Request Service
                                        </Button>
                                    )}
                                    <Button 
                                        variant="ghost" 
                                        className="justify-start"
                                        onClick={() => {
                                            router.push('/profile')
                                            setIsMobileMenuOpen(false)
                                        }}
                                    >
                                        Profile
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        className="justify-start text-red-600"
                                        onClick={handleLogout}
                                    >
                                        Logout
                                    </Button>
                                </>
                            )}

                            {!user && (
                                <div className="flex flex-col space-y-2 pt-4 border-t border-gray-200">
                                    <Button 
                                        variant="ghost" 
                                        className="justify-start"
                                        onClick={() => {
                                            router.push('/login')
                                            setIsMobileMenuOpen(false)
                                        }}
                                    >
                                        Login
                                    </Button>
                                    <Button 
                                        className="bg-green-600 hover:bg-green-700 justify-start"
                                        onClick={() => {
                                            router.push('/signup')
                                            setIsMobileMenuOpen(false)
                                        }}
                                    >
                                        Sign Up
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </nav>
    )
}