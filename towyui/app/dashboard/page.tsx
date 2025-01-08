"use client"

import { useEffect, useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { ServiceRequest } from "@/types/service"

export default function DashboardPage() {
    const { user } = useAuth()
    const [requests, setRequests] = useState<ServiceRequest[]>([])

    useEffect(() => {
        const fetchRequests = async () => {
            try {
                const response = await fetch('http://localhost:4000/api/services/user-requests', {
                    headers: {
                        'Authorization': `Bearer ${localStorage.getItem('token')}`
                    }
                })
                if (response.ok) {
                    const data = await response.json()
                    setRequests(data)
                }
            } catch (error) {
                console.error('Error fetching requests:', error)
            }
        }

        if (user) {
            fetchRequests()
        }
    }, [user])

    return (
        <div className="container mx-auto py-20">
            <h1 className="text-3xl font-bold mb-6">Your Service Requests</h1>
            <div className="grid gap-4">
                {requests.map((request) => (
                    <div 
                        key={request.id} 
                        className="p-4 border rounded-lg shadow-sm"
                    >
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="font-semibold">{request.serviceType}</h3>
                                <p className="text-gray-600">{request.location}</p>
                                <p className="text-sm text-gray-500">{request.description}</p>
                            </div>
                            <span className={`px-2 py-1 rounded text-sm ${
                                request.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                request.status === 'accepted' ? 'bg-green-100 text-green-800' :
                                request.status === 'completed' ? 'bg-blue-100 text-blue-800' :
                                'bg-red-100 text-red-800'
                            }`}>
                                {request.status}
                            </span>
                        </div>
                    </div>
                ))}
                {requests.length === 0 && (
                    <p className="text-gray-500 text-center">No service requests yet.</p>
                )}
            </div>
        </div>
    )
} 