"use client"

import { useState } from "react"
import { authService } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"

export function LoginForm() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const { setUser } = useAuth()

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      const response = await authService.login({ email, password })
      if (response.token && response.user) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
        router.push(response.user.role === 'provider' ? '/provider/dashboard' : '/dashboard')
      }
    } catch (err) {
      console.error('Login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  const loginAsProvider = async () => {
    setIsLoading(true)
    try {
      const formData = new FormData(document.querySelector('form') as HTMLFormElement)
      const email = formData.get("email") as string
      const password = formData.get("password") as string

      const response = await authService.loginProvider({ 
        email,
        password
      })

      if (response.token) {
        localStorage.setItem('token', response.token)
        localStorage.setItem('user', JSON.stringify(response.user))
        setUser(response.user)
        router.push('/provider/dashboard')
      }
    } catch (err) {
      console.error('Provider login error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-sm md:max-w-md mx-auto space-y-6 md:space-y-8">
      <div className="text-center">
        <h2 className="text-xl md:text-2xl font-bold">Login</h2>
        <p className="text-gray-600 mt-2 text-sm md:text-base">Enter your credentials to access your account</p>
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