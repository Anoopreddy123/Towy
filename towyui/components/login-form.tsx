"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/AuthContext"
import { authService } from "@/services/api"

export function LoginForm() {
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const { setUser } = useAuth()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData(event.currentTarget)
            const credentials = {
                email: formData.get('email') as string,
                password: formData.get('password') as string,
            }
            
            console.log('Submitting credentials:', credentials);
            
            const response = await authService.login(credentials)
            console.log('Login response:', response);

            setUser(response.user)
            router.push(response.user.role === 'provider' ? '/provider/dashboard' : '/dashboard')
        } catch (error) {
            console.error('Login error:', error);
            toast({
                variant: "destructive",
                title: "Error",
                description: error instanceof Error ? error.message : "Invalid email or password",
            })
        } finally {
            setIsLoading(false)
        }
    }

    const loginAsProvider = async () => {
        setIsLoading(true)
        try {
            const response = await authService.login({
                email: "anoopreddy51@gmail.com", // Your provider email
                password: "password123",
            })

            setUser(response.user)
            router.push('/provider/dashboard')
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to login as provider",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-sm space-y-8">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Welcome Back</h1>
                <p className="text-gray-500">Enter your credentials to access your account</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Input
                        name="email"
                        placeholder="Email"
                        required
                        type="email"
                    />
                </div>
                <div className="space-y-2">
                    <Input
                        name="password"
                        placeholder="Password"
                        required
                        type="password"
                    />
                </div>
                <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                >
                    {isLoading ? "Signing in..." : "Sign In"}
                </Button>
            </form>
            <div className="text-center">
                <Button
                    variant="outline"
                    onClick={loginAsProvider}
                    disabled={isLoading}
                    className="w-full"
                >
                    Login as Provider (Demo)
                </Button>
            </div>
        </div>
    )
} 