"use client"

import { useState, useEffect } from "react"
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
    const [location, setLocation] = useState<{
        latitude: number | null;
        longitude: number | null;
    }>({
        latitude: null,
        longitude: null
    })

    const getLocation = () => {
        if (!navigator.geolocation) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Geolocation is not supported by your browser",
            });
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude
                });
            },
            (error) => {
                toast({
                    variant: "destructive",
                    title: "Location Error",
                    description: "Please enable location services",
                });
            }
        );
    };
    const router = useRouter()
    const { toast } = useToast()

    useEffect(() => {
        if (role === 'provider') {
            getLocation();
        }
    }, [role]);

 

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)

        if (role === 'provider' && (!location.latitude || !location.longitude)) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Shop location is required",
            });
            setIsLoading(false);
            return;
        }

        try {
            const formData = new FormData(event.currentTarget)
            const response = await authService.signup({
                name: formData.get('name') as string,
                email: formData.get('email') as string,
                password: formData.get('password') as string,
                role: role,
                ...(role === 'provider' && {
                    businessName: formData.get('businessName') as string,
                    phoneNumber: formData.get('phoneNumber') as string,
                    services: services ? [services] : undefined,
                    latitude: location.latitude,
                    longitude: location.longitude
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
                    <Input name="name" placeholder="Full Name" required />
                </div>
                <div className="space-y-2">
                    <Input name="email" placeholder="Email" required type="email" />
                </div>
                <div className="space-y-2">
                    <Input name="password" placeholder="Password" required type="password" />
                </div>
                <div className="space-y-2">
                    <Select value={role} onValueChange={setRole}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select account type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="customer">Customer</SelectItem>
                            <SelectItem value="provider">Service Provider</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {role === 'provider' && (
                    <>
                        <div className="space-y-2">
                            <Input name="businessName" placeholder="Business Name" required />
                        </div>
                        <div className="space-y-2">
                            <Input name="phoneNumber" placeholder="Phone Number" required />
                        </div>
                        <div className="space-y-2">
                            <Select value={services} onValueChange={setServices}>
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
                        <div className="space-y-2">
                            <div className="flex justify-between items-center p-4 border rounded-lg">
                                <div className="text-sm">
                                    <p className="font-medium">Shop Location</p>
                                    {location.latitude && location.longitude ? (
                                        <p className="text-gray-500">
                                            {location.latitude.toFixed(6)}, {location.longitude.toFixed(6)}
                                        </p>
                                    ) : (
                                        <p className="text-gray-500">No location set</p>
                                    )}
                                </div>
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={getLocation}
                                >
                                    {location.latitude ? "Update Location" : "Get Location"}
                                </Button>
                            </div>
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