"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "@/services/api"
import { Button } from "@/components/ui/button"
import { Plus, Zap, Clock, MapPin } from "lucide-react"

interface ServiceRequest {
    id: string
    serviceType: string
    location: string
    status: string
    description?: string
    createdAt: string
}

interface User {
    id: string
    name: string
    email: string
    role: string
    businessName?: string
}

export default function DashboardPage() {
    const router = useRouter()
    const [user, setUser] = useState<User | null>(null)
    const [requests, setRequests] = useState<ServiceRequest[]>([])

    useEffect(() => {
        // Get user from localStorage
        const userData = localStorage.getItem('user')
        if (!userData) {
            router.push('/login')
            return
        }
        setUser(JSON.parse(userData))

        // Fetch user's service requests
        fetch(`${API_URL}/services/user-requests`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(res => res.json())
        .then(data => {
            // Ensure data is an array, handle different response formats
            if (Array.isArray(data)) {
                setRequests(data)
            } else if (data && Array.isArray(data.requests)) {
                setRequests(data.requests)
            } else if (data && Array.isArray(data.data)) {
                setRequests(data.data)
            } else {
                console.warn('Unexpected API response format:', data)
                setRequests([])
            }
        })
        .catch(error => {
            console.error('Error fetching service requests:', error)
            setRequests([])
        })
    }, [router])

    if (!user) return null

    return (
        <div className="container mx-auto py-20 px-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
                <h1 className="text-3xl font-bold mb-4 md:mb-0">
                    Hi {user?.businessName || user?.name || 'there'}
                </h1>
                <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                        onClick={() => router.push('/request-service')}
                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 font-medium"
                    >
                        <Plus className="h-4 w-4 mr-2" />
                        Request New Service
                    </Button>
                </div>
            </div>

            {/* Service Types Display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <ServiceTypeCard 
                    icon={<Zap className="h-5 w-5" />}
                    title="Emergency Towing"
                    subtitle="24/7 fast response"
                />
                <ServiceTypeCard 
                    icon={<Clock className="h-5 w-5" />}
                    title="Roadside Assistance"
                    subtitle="Jump start, tire change"
                />
                <ServiceTypeCard 
                    icon={<MapPin className="h-5 w-5" />}
                    title="Vehicle Recovery"
                    subtitle="Safe transport"
                />
            </div>
            
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">Your Service Requests</h2>
                <div className="space-y-4">
                    {Array.isArray(requests) && requests.map((request) => (
                        <div 
                            key={request.id} 
                            className={`p-4 border rounded-lg shadow-sm transition-all ${
                                request.status === 'completed' 
                                    ? 'opacity-60 cursor-not-allowed' 
                                    : 'hover:shadow-md cursor-pointer'
                            }`}
                            onClick={() => {
                                if (request.status !== 'completed') {
                                    router.push(`/service-providers/${request.id}`)
                                }
                            }}
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-semibold text-lg">{request.serviceType}</h3>
                                    <p className="text-gray-600">{request.location}</p>
                                    {request.description && (
                                        <p className="text-sm text-gray-500 mt-1">{request.description}</p>
                                    )}
                                    <p className="text-sm text-gray-500 mt-1">
                                        {new Date(request.createdAt).toLocaleDateString()}
                                    </p>
                                    {request.status !== 'completed' && (
                                        <p className="text-xs text-blue-600 mt-2">
                                            Click to view nearby providers
                                        </p>
                                    )}
                                </div>
                                <span className={`px-3 py-1 rounded-full text-sm ${
                                    request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                    request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                    request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                    'bg-red-100 text-red-800'
                                }`}>
                                    {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                                </span>
                            </div>
                        </div>
                    ))}
                    {(!Array.isArray(requests) || requests.length === 0) && (
                        <p className="text-gray-500 text-center py-4">No service requests yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
}

function ServiceTypeCard({ icon, title, subtitle }: { 
    icon: React.ReactNode; 
    title: string; 
    subtitle: string; 
}) {
    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                    {icon}
                </div>
                <div>
                    <h3 className="font-semibold text-gray-800">{title}</h3>
                    <p className="text-sm text-gray-600">{subtitle}</p>
                </div>
            </div>
        </div>
    )
} 