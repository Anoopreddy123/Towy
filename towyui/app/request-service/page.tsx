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
    const [placeName, setPlaceName] = useState<string | null>(null)
    const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(null)
    const router = useRouter()
    const { toast } = useToast()
    const { user } = useAuth()

    const reverseGeocode = async (lat: number, lng: number): Promise<string | null> => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&zoom=14&addressdetails=1`, {
                headers: {
                    'User-Agent': 'towy-ui/1.0 (reverse-geocoder)'
                }
            })
            if (!res.ok) return null
            const data = await res.json()
            const address = data.address || {}
            const city = address.city || address.town || address.village || address.hamlet
            const state = address.state
            const display = [city, state].filter(Boolean).join(', ') || data.display_name
            setPlaceName(display)
            return display
        } catch (e) {
            // ignore
            return null
        }
    }

    const handleGetLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const locationInput = document.getElementById('location') as HTMLInputElement
                if (locationInput) {
                    setCoords({ lat: position.coords.latitude, lng: position.coords.longitude })
                    const display = await reverseGeocode(position.coords.latitude, position.coords.longitude)
                    if (display) {
                        locationInput.value = display
                    } else {
                        locationInput.value = `${position.coords.latitude}, ${position.coords.longitude}`
                    }
                }
            })
        }
    }

    const handleLocationBlur = (e: React.FocusEvent<HTMLInputElement>) => {
        const val = e.currentTarget.value
        if (!val) return
        const parts = val.split(',')
        if (parts.length !== 2) return
        const lat = parseFloat(parts[0].trim())
        const lng = parseFloat(parts[1].trim())
        if (Number.isFinite(lat) && Number.isFinite(lng)) {
            setCoords({ lat, lng })
            ;(async () => {
                const display = await reverseGeocode(lat, lng)
                if (display) {
                    e.currentTarget.value = display
                }
            })()
        }
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        setIsLoading(true)

        try {
            const formData = new FormData(event.currentTarget)
            const locationInput = formData.get('location') as string

            let submitCoords = coords
            // Fallback: if user pasted raw coords and didn't trigger blur, parse here
            if (!submitCoords && locationInput && locationInput.includes(',')) {
                const parts = locationInput.split(',')
                if (parts.length === 2) {
                    const maybeLat = parseFloat(parts[0].trim())
                    const maybeLng = parseFloat(parts[1].trim())
                    if (Number.isFinite(maybeLat) && Number.isFinite(maybeLng)) {
                        submitCoords = { lat: maybeLat, lng: maybeLng }
                    }
                }
            }

            if (!submitCoords) {
                throw new Error('Location coordinates missing')
            }

            const response = await fetch(`${API_URL}/services/request`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    serviceType,
                    location: locationInput, // backend will normalize to friendly name
                    coordinates: submitCoords,
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
                                onBlur={handleLocationBlur}
                            />
                            <Button 
                                type="button"
                                variant="outline"
                                onClick={handleGetLocation}
                            >
                                📍 Current Location
                            </Button>
                        </div>
                        {placeName && (
                            <p className="text-sm text-gray-600">{placeName}</p>
                        )}
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