"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/AuthContext"
import { API_URL } from "@/services/api"

type NearbyRequest = {
    id: string
    serviceType: string
    location: string | null
    description?: string | null
    vehicleType?: string | null
    status: string
    createdAt: string
    distanceMiles?: number
}

export default function ProviderDashboard() {
    const { user } = useAuth()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [requests, setRequests] = useState<NearbyRequest[]>([])

    useEffect(() => {
        const fetchNearby = async () => {
            if (!user) return
            setLoading(true)
            setError(null)
            try {
                const res = await fetch(`${API_URL}/services/nearby-requests`, {
                    headers: {
                        "Authorization": `Bearer ${localStorage.getItem("token")}`
                    }
                })
                if (!res.ok) {
                    throw new Error(`Failed to fetch nearby requests (${res.status})`)
                }
                const data = await res.json()
                setRequests(data)
            } catch (e: any) {
                setError(e?.message || "Failed to load requests")
            } finally {
                setLoading(false)
            }
        }
        fetchNearby()
    }, [user])

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-black-600 mb-4 break-words mt-12">
                        Welcome {user?.businessName || user?.name || 'Provider'}
                    </h1>

                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">Nearby Service Requests</h2>
                        {loading && (
                            <p className="text-sm text-gray-500">Loading...</p>
                        )}
                        {error && (
                            <p className="text-sm text-red-600">{error}</p>
                        )}
                        {!loading && !error && requests.length === 0 && (
                            <p className="text-sm text-gray-500">No requests found within your area.</p>
                        )}

                        <div className="space-y-3">
                            {requests.map((r) => (
                                <div
                                    key={r.id}
                                    className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition"
                                    onClick={() => router.push(`/provider/service/${r.id}`)}
                                    role="button"
                                    aria-label={`View request ${r.serviceType}`}
                                >
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <p className="font-medium">{r.serviceType}</p>
                                            <p className="text-sm text-gray-600">{r.location || 'Unknown location'}</p>
                                            {r.description && (
                                                <p className="text-xs text-gray-500 mt-1">{r.description}</p>
                                            )}
                                            <p className="text-xs text-gray-500 mt-1">{new Date(r.createdAt).toLocaleString()}</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-xs px-2 py-1 rounded bg-yellow-100 text-yellow-800">
                                                {r.status}
                                            </span>
                                            {typeof r.distanceMiles === 'number' && (
                                                <p className="text-xs text-gray-500 mt-2">{r.distanceMiles.toFixed(1)} mi</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}