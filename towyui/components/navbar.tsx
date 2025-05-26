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
import { UserCircle } from "lucide-react"

export default function Navbar() {
    const { user, isLoading, logout } = useAuth()
    const router = useRouter()

    const handleLogout = () => {
        logout()
        router.push('/')
    }

    if (isLoading) return null;

    return (
        <nav className="fixed w-full bg-white z-50 shadow-sm">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                    <Link href="/" className="text-2xl font-bold text-green-600">
                        TOWY
                    </Link>

                    <div className="flex items-center gap-4">
                        <Link href="/" className="hover:text-green-600">Home</Link>
                        <Link href="/about" className="hover:text-green-600">About</Link>
                        
                        {user && (
                            <>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="flex items-center gap-2">
                                            <UserCircle className="h-5 w-5" />
                                            {user.businessName || user.name || user.email}
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
                </div>
            </div>
        </nav>
    )
}