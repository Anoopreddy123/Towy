"use client"

import { useEffect, useMemo, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { API_URL } from "@/services/api"

type ServiceDetail = {
    id: string
    serviceType: string
    location: string
    description?: string | null
    vehicleType?: string | null
    status: string
    createdAt: string
    quotedPrice?: number | null
    user?: { name?: string; email?: string } | null
}

export default function ProviderServiceDetailPage() {
    const { id } = useParams()
    const [service, setService] = useState<ServiceDetail | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await fetch(`${API_URL}/services/request/${id}`, {
                    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
                })
                if (!res.ok) throw new Error('Failed to load service')
                const data = await res.json()
                setService(data)
            } catch (e) {
                // fall back to static if fetch fails
                setService({
                    id: String(id),
                    serviceType: "towing",
                    location: "Long Beach, California",
                    description: "Vehicle won’t start, parked in a safe spot by the curb.",
                    vehicleType: "SUV",
                    status: "pending",
                    createdAt: new Date().toISOString(),
                    quotedPrice: 95,
                    user: { name: "John Doe", email: "john@example.com" }
                })
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [id])

    const mapsLink = useMemo(() => {
        if (!service) return "#"
        return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(service.location)}`
    }, [service])

    if (loading) {
        return (
            <div className="container mx-auto py-20">
                <p>Loading service...</p>
            </div>
        )
    }

    if (!service) {
        return (
            <div className="container mx-auto py-20">
                <p>Service not found.</p>
            </div>
        )
    }

    return (
        <div className="container mx-auto py-16 px-4">
            <div className="max-w-3xl mx-auto bg-white rounded-lg shadow p-6 space-y-6">
                <div className="flex items-start justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">{service.serviceType}</h1>
                        <p className="text-sm text-gray-500 mt-1">Requested on {new Date(service.createdAt).toLocaleString()}</p>
                    </div>
                    <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800 h-fit">
                        {service.status}
                    </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <h2 className="font-semibold">Location</h2>
                        <p className="text-gray-700">{service.location}</p>
                        <a href={mapsLink} target="_blank" rel="noopener noreferrer" className="text-blue-600 text-sm">Directions ↗</a>
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-semibold">Vehicle</h2>
                        <p className="text-gray-700">{service.vehicleType || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-semibold">Quoted Price</h2>
                        <p className="text-gray-700">${service.quotedPrice ?? 95}</p>
                        <div className="flex items-center gap-2">
                            <Button variant="outline" size="sm">Negotiate</Button>
                            <Button variant="default" size="sm">Accept</Button>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <h2 className="font-semibold">Customer</h2>
                        <p className="text-gray-700">{service.user?.name || 'Customer'}</p>
                        <p className="text-gray-700 text-sm">{service.user?.email || ''}</p>
                    </div>
                </div>

                <div>
                    <h2 className="font-semibold mb-1">Description</h2>
                    <p className="text-gray-700 whitespace-pre-wrap">{service.description || 'No description provided.'}</p>
                </div>
            </div>
        </div>
    )
}


