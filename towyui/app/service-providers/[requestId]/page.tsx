"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { User } from "@/types/user"
import { ServiceRequest } from "@/types/service"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function NearbyProvidersPage() {
    const [providers, setProviders] = useState<User[]>([])
    const [request, setRequest] = useState<ServiceRequest | null>(null)
    const [loading, setLoading] = useState(true)
    const { requestId } = useParams()
    const { toast } = useToast()

    useEffect(() => {
        const fetchRequestAndProviders = async () => {
            try {
                // Fetch service request details
                const requestResponse = await fetch(`http://localhost:4000/api/services/request/${requestId}`, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!requestResponse.ok) {
                    throw new Error('Failed to fetch service request');
                }

                const requestData = await requestResponse.json();
                console.log('Service request data:', requestData);
                setRequest(requestData);

                if (!requestData.coordinates) {
                    console.error('No coordinates in request data');
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Location data is missing from the request.",
                    });
                    return;
                }

                // Fetch nearby providers
                const providersUrl = `http://localhost:4000/api/services/nearby-providers?latitude=${requestData.coordinates.lat}&longitude=${requestData.coordinates.lng}&serviceType=${requestData.serviceType}`;
                console.log('Fetching providers with URL:', providersUrl);
                
                const providersResponse = await fetch(providersUrl, {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                });

                if (!providersResponse.ok) {
                    throw new Error('Failed to fetch providers');
                }

                const providersData = await providersResponse.json();
                console.log('Providers response:', providersData);
                setProviders(providersData);
            } catch (error) {
                console.error('Error:', error);
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: error instanceof Error ? error.message : "Failed to fetch data",
                });
            } finally {
                setLoading(false);
            }
        };

        fetchRequestAndProviders();
    }, [requestId, toast]);

    const notifyProvider = async (providerId: string) => {
        try {
            const response = await fetch(`http://localhost:4000/api/services/notify-provider`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    requestId,
                    providerId
                })
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Provider has been notified",
                })
            }
        } catch (error) {
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to notify provider",
            })
        }
    }

    if (loading) {
        return (
            <div className="container mx-auto py-20">
                <div className="flex justify-center items-center min-h-[400px]">
                    <p>Loading providers...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-20">
            <h1 className="text-3xl font-bold mb-6">Nearby Service Providers</h1>
            
            {request && (
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <h2 className="font-semibold mb-2">Your Request Details:</h2>
                    <p>Service: {request.serviceType}</p>
                    <p>Location: {request.location}</p>
                    <p>Vehicle: {request.vehicleType}</p>
                </div>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {providers.length > 0 ? (
                    providers.map((provider) => (
                        <div key={provider.id} className="border rounded-lg p-4 shadow-sm">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="font-semibold">{provider.name}</h3>
                                    <p className="text-sm text-gray-600">{provider.businessName}</p>
                                    <p className="text-sm text-gray-600">Distance: {provider.distance?.toFixed(1)} km</p>
                                    <p className="text-sm text-gray-600">Services: {provider.services?.join(', ')}</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        onClick={() => notifyProvider(provider.id)}
                                        className="bg-green-600 hover:bg-green-700"
                                    >
                                        Notify
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-gray-500 col-span-full text-center py-10">
                        No service providers found in your area.
                        <br />
                        <span className="text-sm mt-2 block">
                            Try expanding your search area or checking back later.
                        </span>
                    </p>
                )}
            </div>
        </div>
    )
} 