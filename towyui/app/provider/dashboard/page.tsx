"use client"

import { useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"

export default function ProviderDashboard() {
    const { user } = useAuth()

    useEffect(() => {
        const debugInfo = {
            url: window.location.href,
            timestamp: new Date().toISOString(),
            userAgent: window.navigator.userAgent,
            userData: user
        }
        console.log("Debug Info:", debugInfo);
    }, [user])

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="px-4 py-6 sm:px-6 lg:px-8">
                <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
                    <h1 className="text-2xl sm:text-3xl font-bold text-black-600 mb-4 break-words mt-12">
                        Welcome {user?.businessName || user?.businessName || user?.name || 'Provider'}
                    </h1>
                    
                    {/* Status Card */}
                    {/* <div className="bg-yellow-50 rounded-lg p-4 mb-4">
                        <p className="text-sm sm:text-base text-yellow-700">
                            User ID: {user?.id || 'Not logged in'}
                        </p>
                    </div> */}

                    {/* Quick Actions */}
                    <div className="grid grid-cols-2 gap-3 mb-4">
                        <button className="p-3 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors">
                            View Requests
                        </button>
                        <button className="p-3 text-sm bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors">
                            Update Status
                        </button>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Active Requests</p>
                            <p className="text-lg font-semibold">0</p>
                        </div>
                        <div className="bg-gray-50 p-3 rounded-lg">
                            <p className="text-xs text-gray-500">Completed Today</p>
                            <p className="text-lg font-semibold">0</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}