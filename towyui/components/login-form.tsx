"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { authService } from "@/services/api"

export function LoginForm() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await authService.login({ email, password })
      console.log("Login response:", response)
      
      window.location.href = response.user.role === 'provider' 
        ? '/provider/dashboard' 
        : '/dashboard'
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loginAsProvider = async () => {
    setIsLoading(true)
    try {
      const response = await authService.login({ 
        email: "anoopreddy51@gmail.com", 
        password: "password123",
        role: "provider"
      })
      console.log("Provider login response:", response)
      
      window.location.href = '/provider/dashboard'
    } catch (error) {
      console.error('Provider login failed:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto space-y-8">
      <div className="text-center">
        <h2 className="text-2xl font-bold">Login</h2>
        <p className="text-gray-600 mt-2">Enter your credentials to access your account</p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <Input id="password" name="password" type="password" required />
        </div>
        <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={isLoading}>
          {isLoading ? "Logging in..." : "Login"}
        </Button>
      </form>
      
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-gray-500">Or</span>
        </div>
      </div>

      <Button 
        variant="outline" 
        onClick={loginAsProvider}
        className="w-full"
        disabled={isLoading}
      >
        Login as Provider
      </Button>
    </div>
  )
} 