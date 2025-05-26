"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ServiceType } from "@/types/service"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { API_URL } from "@/services/api"

export function ServiceRequestForm() {
    const { user } = useAuth()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [location, setLocation] = useState("")
    const [coordinates, setCoordinates] = useState<{lat: number, lng: number} | null>(null)
    const { toast } = useToast()
    const router = useRouter()

    const getCurrentLocation = () => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setCoordinates({ lat: latitude, lng: longitude });
                    setLocation(`${latitude}, ${longitude}`); // Temporary location string
                    
                    toast({
                        title: "Location Found",
                        description: "Your current location has been set.",
                    });
                },
                (error) => {
                    console.error("Geolocation error:", error);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Unable to get your location. Please enter it manually.",
                    });
                }
            );
        }
    };

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        
        if (!user) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please login to request a service",
            })
            router.push('/login')
            return
        }

        if (!coordinates) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please allow location access or enter your location",
            })
            return
        }

        setIsSubmitting(true)

        try {
            const formData = new FormData(event.currentTarget)
            const requestData = {
                serviceType: formData.get('serviceType'),
                location: formData.get('location'),
                vehicleType: formData.get('vehicleType'),
                description: formData.get('description'),
                coordinates
            }

            const response = await fetch(`${API_URL}/services/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(requestData)
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || 'Failed to create service request')
            }

            const { service } = await response.json()
            router.push(`/service-providers/${service.id}`)
        } catch {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to create service request. Please try again.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            <div>
                <label className="block text-sm font-medium mb-2">Service Type</label>
                <Select name="serviceType" required>
                    <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value={ServiceType.TOWING}>Towing</SelectItem>
                        <SelectItem value={ServiceType.GAS_DELIVERY}>Gas Delivery</SelectItem>
                        <SelectItem value={ServiceType.MECHANIC}>Mechanic</SelectItem>
                        <SelectItem value={ServiceType.BATTERY_JUMP}>Battery Jump</SelectItem>
                        <SelectItem value={ServiceType.TIRE_CHANGE}>Tire Change</SelectItem>
                        <SelectItem value={ServiceType.LOCKOUT}>Lockout</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="flex gap-2">
                    <Input 
                        name="location" 
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Enter your location" 
                        required 
                    />
                    <Button 
                        type="button"
                        variant="outline"
                        onClick={getCurrentLocation}
                    >
                        📍 Current Location
                    </Button>
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Vehicle Type</label>
                <Input name="vehicleType" placeholder="e.g., Sedan, SUV, Truck" required />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <Textarea 
                    name="description" 
                    placeholder="Describe your situation..." 
                    className="h-32"
                />
            </div>

            <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting ? "Creating Request..." : "Submit Request"}
            </Button>
        </form>
    )
}