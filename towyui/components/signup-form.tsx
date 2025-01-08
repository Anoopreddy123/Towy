"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { authService } from "@/services/api"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SignupForm() {
    const [isLoading, setIsLoading] = useState(false)
    const [role, setRole] = useState("customer")
    const [services, setServices] = useState("")
    const router = useRouter()
    const { toast } = useToast()

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData(event.currentTarget)
            const response = await authService.signup({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                role: role,
                // Add provider-specific fields if role is provider
                ...(role === 'provider' && {
                    businessName: formData.get('businessName') as string,
                    phoneNumber: formData.get('phoneNumber') as string,
                    services: services,
                })
            })

            toast({
                title: "Account created",
                description: "Please login with your credentials",
            })
            router.push('/login')
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create account",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="mx-auto max-w-sm space-y-8">
            <div className="space-y-2 text-center">
                <h1 className="text-3xl font-bold">Create an Account</h1>
                <p className="text-gray-500">Enter your information to create an account</p>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Input
                        name="name"
                        placeholder="Full Name"
                        required
                    />
                </div>
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
                <div className="space-y-2">
                    <Select 
                        value={role} 
                        onValueChange={setRole}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="provider">Service Provider</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Additional fields for providers */}
                {role === 'provider' && (
                    <>
                        <div className="space-y-2">
                            <Input
                                name="businessName"
                                placeholder="Business Name"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                name="phoneNumber"
                                placeholder="Phone Number"
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Select 
                                value={services}
                                onValueChange={setServices}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select primary service" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="towing">Towing</SelectItem>
                                    <SelectItem value="battery_jump">Battery Jump</SelectItem>
                                    <SelectItem value="tire_change">Tire Change</SelectItem>
                                    <SelectItem value="gas_delivery">Gas Delivery</SelectItem>
                                    <SelectItem value="lockout">Lockout</SelectItem>
                                    <SelectItem value="mechanic">Mechanic</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </>
                )}

                <Button
                    className="w-full bg-green-600 hover:bg-green-700"
                    disabled={isLoading}
                >
                    {isLoading ? "Creating account..." : "Create Account"}
                </Button>
            </form>
        </div>
    )
} 