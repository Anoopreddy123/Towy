"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/contexts/AuthContext"
import { API_URL } from "@/services/api"

export default function RequestServicePage() {
    const [isLoading, setIsLoading] = useState(false)
    const [serviceType, setServiceType] = useState("")
    const router = useRouter()
    const { toast } = useToast()
    const { user } = useAuth()

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition((position) => {
                const locationInput = document.getElementById('location') as HTMLInputElement
                if (locationInput) {
                    locationInput.value = `${position.coords.latitude}, ${position.coords.longitude}`
                }
            })
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData(event.currentTarget)
            const location = formData.get('location') as string
            const [lat, lng] = location.split(',').map(coord => parseFloat(coord.trim()))

            const response = await fetch(`${API_URL}/services/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    serviceType,
                    location: formData.get('location'),
                    coordinates: { lat, lng },
                    vehicleType: formData.get('vehicleType'),
                    description: formData.get('description')
                })
            })

            if (!response.ok) throw new Error('Failed to create request')

            const data = await response.json()
            router.push(`/service-providers/${data.service.id}`)
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create service request",
            })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="container mx-auto py-20">
            <div className="max-w-2xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Request a Service</h1>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Service Type</label>
                        <Select value={serviceType} onValueChange={setServiceType} required>
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Select service type" />
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
                        <label className="text-sm font-medium">Location</label>
                        <div className="flex gap-2">
                            <Input
                                id="location"
                                name="location"
                                placeholder="Enter your location"
                                required
                                className="flex-1"
                            />
                            <Button 
                                type="button"
                                variant="outline"
                                onClick={handleGetLocation}
                            >
                                📍 Current Location
                            </Button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Vehicle Type</label>
                        <Input
                            name="vehicleType"
                            placeholder="e.g., Sedan, SUV, Truck"
                            required
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Description</label>
                        <Textarea
                            name="description"
                            placeholder="Describe your situation..."
                            className="min-h-[100px]"
                        />
                    </div>

                    <Button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700"
                        disabled={isLoading}
                    >
                        {isLoading ? "Submitting..." : "Submit Request"}
                    </Button>
                </form>
            </div>
        </div>
    )
} 