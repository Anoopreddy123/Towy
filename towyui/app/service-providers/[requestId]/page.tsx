"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { User } from "@/types/service"
import { ServiceRequest } from "@/types/service"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { API_URL } from "@/services/api"

export default function NearbyProvidersPage() {
    const [providers, setProviders] = useState<User[]>([])
    const [request, setRequest] = useState<ServiceRequest | null>(null)
    const [loading, setLoading] = useState(true)
    const [radiusMiles, setRadiusMiles] = useState<number>(20)
    const { requestId } = useParams()
    const { toast } = useToast()

    useEffect(() => {
        const fetchRequestAndProviders = async () => {
            try {
                // Fetch service request details
                const requestResponse = await fetch(
                    `${API_URL}/services/request/${requestId}`,
                    {
                        headers: {
                            "Authorization": `Bearer ${localStorage.getItem("token")}`
                        }
                    }
                );

                if (!requestResponse.ok) {
                    throw new Error('Failed to fetch service request');
                }

                const requestData = await requestResponse.json();
                console.log('Service request data:', requestData);
                console.log('Coordinates check:', requestData.coordinates);
                console.log('Coordinates exists:', !!requestData.coordinates);
                console.log('Lat exists:', !!requestData.coordinates?.lat);
                console.log('Lng exists:', !!requestData.coordinates?.lng);
                
                // Parse coordinates if they come as a JSON string (backend fallback)
                let parsedCoordinates = requestData.coordinates;
                if (typeof requestData.coordinates === 'string' && requestData.coordinates.startsWith('{')) {
                    try {
                        parsedCoordinates = JSON.parse(requestData.coordinates);
                        console.log('Parsed coordinates from string:', parsedCoordinates);
                        // Update the request data with parsed coordinates
                        requestData.coordinates = parsedCoordinates;
                    } catch (e) {
                        console.error('Failed to parse coordinates string:', e);
                    }
                }
                
                // Normalize field names from snake_case to camelCase (backend compatibility)
                if (requestData.service_type && !requestData.serviceType) {
                    requestData.serviceType = requestData.service_type;
                }
                if (requestData.vehicle_type && !requestData.vehicleType) {
                    requestData.vehicleType = requestData.vehicle_type;
                }
                if (requestData.created_at && !requestData.createdAt) {
                    requestData.createdAt = requestData.created_at;
                }
                if (requestData.updated_at && !requestData.updatedAt) {
                    requestData.updatedAt = requestData.updated_at;
                }
                
                setRequest(requestData);

                if (!parsedCoordinates || 
                    typeof parsedCoordinates.lat !== 'number' || 
                    typeof parsedCoordinates.lng !== 'number' ||
                    isNaN(parsedCoordinates.lat) || 
                    isNaN(parsedCoordinates.lng)) {
                    console.error('No valid coordinates in request data:', parsedCoordinates);
                    console.error('Coordinate types:', {
                        lat: typeof parsedCoordinates?.lat,
                        lng: typeof parsedCoordinates?.lng,
                        latValue: parsedCoordinates?.lat,
                        lngValue: parsedCoordinates?.lng
                    });
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Location data is missing from the request.",
                    });
                    return;
                }

                if (!requestData.serviceType) {
                    console.error('No service type in request data:', requestData);
                    toast({
                        variant: "destructive",
                        title: "Error",
                        description: "Service type is missing from the request.",
                    });
                    return;
                }

                // Fetch nearby providers using selected radius (miles -> km)
                const radiusKm = Math.round(radiusMiles * 1.60934)
                const providersUrl = `${API_URL}/services/nearby-providers?latitude=${parsedCoordinates.lat}&longitude=${parsedCoordinates.lng}&serviceType=${requestData.serviceType}&radius=${radiusKm}`;
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
            } catch (err) {
                console.error('Error:', err)
                toast({
                    variant: "destructive",
                    title: "Error",
                    description: "Failed to fetch providers"
                })
            } finally {
                setLoading(false);
            }
        };

        fetchRequestAndProviders();
    }, [requestId, toast, radiusMiles]);

    const markAsComplete = async () => {
        try {
            const response = await fetch(`${API_URL}/services/request/${requestId}/status`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    status: 'completed'
                })
            })

            if (response.ok) {
                toast({
                    title: "Success",
                    description: "Service request marked as complete",
                })
                // Redirect to dashboard after a short delay
                setTimeout(() => {
                    window.location.href = '/dashboard'
                }, 1500)
            } else {
                throw new Error('Failed to update status')
            }
        } catch (error) {
            console.error('Error marking service as complete:', error)
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to mark service as complete",
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
            <div className="mb-6 flex items-center gap-3">
                <label className="text-sm text-gray-700">Search Radius:</label>
                <select
                    className="border rounded px-2 py-1 text-sm"
                    value={radiusMiles}
                    onChange={(e) => setRadiusMiles(parseInt(e.target.value, 10))}
                >
                    <option value={20}>20 mi</option>
                    <option value={35}>35 mi</option>
                    <option value={40}>40 mi</option>
                    <option value={50}>50 mi</option>
                </select>
            </div>
            
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
                            <div className="mb-4">
                                <h3 className="font-semibold text-lg">{provider.name}</h3>
                                <p className="text-sm text-gray-600 font-medium">{provider.businessName}</p>
                                <p className="text-sm text-gray-500 mt-1">Distance: {provider.distance?.toFixed(1)} km</p>
                                <p className="text-sm text-gray-500">Services: {provider.services?.join(', ')}</p>
                                
                                {/* Contact Information */}
                                <div className="mt-3 pt-3 border-t border-gray-200">
                                    <h4 className="font-medium text-sm text-gray-700 mb-2">Contact Information:</h4>
                                    <div className="space-y-1">
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Phone:</span> {provider.phone}
                                        </p>
                                        <p className="text-sm text-gray-600">
                                            <span className="font-medium">Email:</span> {provider.email}
                                        </p>
                                    </div>
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

            {/* Mark as Complete Button */}
            {request && request.status !== 'completed' && (
                <div className="mt-8 text-center">
                    <Button 
                        onClick={markAsComplete}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
                    >
                        Mark as Complete
                    </Button>
                    <p className="text-sm text-gray-500 mt-2">
                        Mark this service request as complete when you&apos;re done
                    </p>
                </div>
            )}
        </div>
    )
} 