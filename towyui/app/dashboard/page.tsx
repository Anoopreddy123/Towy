"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { API_URL } from "@/services/api"

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
        .then(data => setRequests(data))
        .catch(console.error)
    }, [router])

    if (!user) return null

    return (
        <div className="container mx-auto py-20">
            <h1 className="text-3xl font-bold mb-6">
                Hi {user?.businessName || user?.name || 'there'}
            </h1>
            
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-semibold mb-4">Your Service Requests</h2>
                <div className="space-y-4">
                    {requests.map((request) => (
                        <div 
                            key={request.id} 
                            className="p-4 border rounded-lg shadow-sm hover:shadow-md transition-shadow"
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
                    {requests.length === 0 && (
                        <p className="text-gray-500 text-center py-4">No service requests yet.</p>
                    )}
                </div>
            </div>
        </div>
    )
} 