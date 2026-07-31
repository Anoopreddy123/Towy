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
    const [serviceType, setServiceType] = useState("")
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

        if (!serviceType) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Please select a service type",
            })
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
                serviceType: serviceType,
                location: formData.get('location'),
                vehicleType: formData.get('vehicleType'),
                description: formData.get('description'),
                coordinates
            }

            console.log('Submitting request data:', requestData)
            console.log('API URL:', `${API_URL}/services/request`)
            console.log('Token:', localStorage.getItem('token'))

            const response = await fetch(`${API_URL}/services/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(requestData)
            })

            console.log('Response status:', response.status)
            console.log('Response headers:', response.headers)

            if (!response.ok) {
                const error = await response.json()
                console.error('Server error:', error)
                throw new Error(error.message || 'Failed to create service request')
            }

            const responseData = await response.json()
            console.log('Success response:', responseData)
            
            if (responseData.service) {
                router.push(`/service-providers/${responseData.service.id}`)
            } else {
                console.error('No service ID in response:', responseData)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Service created but no ID returned",
                })
            }
        } catch (error) {
            console.error('Form submission error:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: error.message || "Failed to create service request. Please try again.",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-xl mx-auto">
            <div>
                <label className="block text-sm font-medium mb-2">Service Type</label>
                <Select name="serviceType" required onValueChange={(value) => setServiceType(value)}>
                    <SelectTrigger>
                        <SelectValue placeholder="Select service type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="towing">Towing</SelectItem>
                        <SelectItem value="roadside_assistance">Roadside Assistance</SelectItem>
                        <SelectItem value="vehicle_recovery">Vehicle Recovery</SelectItem>
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