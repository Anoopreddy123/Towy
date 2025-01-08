"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ServiceRequest } from "@/types/service"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function ProviderDashboard() {
    const [requests, setRequests] = useState<ServiceRequest[]>([])
    const [loading, setLoading] = useState(true)
    const { user } = useAuth()
    const { toast } = useToast()

    useEffect(() => {
        const fetchNearbyRequests = async () => {
            try {
                if (!user?.location) {
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Please update your location in profile settings",
                    })
                    return
                }

                const response = await fetch(
                    `http://localhost:4000/api/services/nearby-requests?latitude=${user.location.lat}&longitude=${user.location.lng}`,
                    {
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                        }
                    }
                )

                if (!response.ok) throw new Error('Failed to fetch requests')
                
                const data = await response.json()
                setRequests(data)
            } catch (error) {
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch nearby requests",
                })
            } finally {
                setLoading(false)
            }
        }

        fetchNearbyRequests()
    }, [user, toast])

    if (loading) {
        return (
            <div className="container mx-auto py-20">
                <div className="flex justify-center items-center min-h-[400px]">
                    <p>Loading requests...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-20">
            <h1 className="text-3xl font-bold mb-6">Nearby Service Requests</h1>
            
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {requests.length > 0 ? (
                    requests.map((request) => (
                        <div key={request.id} className="border rounded-lg p-4 shadow-sm">
                            <div className="mb-4">
                                <h3 className="font-semibold">{request.serviceType}</h3>
                                <p className="text-sm text-gray-600">Vehicle: {request.vehicleType}</p>
                                <p className="text-sm text-gray-600">Location: {request.location}</p>
                                {request.description && (
                                    <p className="text-sm text-gray-600">Notes: {request.description}</p>
                                )}
                            </div>
                            <Button 
                                onClick={() => {}} // TODO: Add quote submission
                                className="w-full bg-green-600 hover:bg-green-700"
                            >
                                Submit Quote
                            </Button>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full text-center py-10">
                        No service requests in your area.
                        <br />
                        <span className="text-sm mt-2 block">
                            Check back later for new requests.
                        </span>
                    </p>
                )}
            </div>
        </div>
    )
} 