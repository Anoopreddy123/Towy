"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { User, DollarSign, Clock, CheckCircle } from "lucide-react"

interface UserData {
    id: string
    name: string
    email: string
    role: string
    businessName?: string
}

export default function ProfilePage() {
    const router = useRouter()
    const [user, setUser] = useState<UserData | null>(null)

    useEffect(() => {
        // Get user from localStorage
        const userData = localStorage.getItem('user')
        if (!userData) {
            router.push('/login')
            return
        }
        setUser(JSON.parse(userData))
    }, [router])

    if (!user) return null

    return (
        <div className="container mx-auto py-20 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-8">Profile</h1>
                
                {/* User Information */}
                <Card className="mb-8">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Personal Information
                        </CardTitle>
                        <CardDescription>
                            Your account details and preferences
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-medium text-gray-500">Name</label>
                                <p className="text-lg">{user.name}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Email</label>
                                <p className="text-lg">{user.email}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-gray-500">Role</label>
                                <p className="text-lg capitalize">{user.role}</p>
                            </div>
                            {user.businessName && (
                                <div>
                                    <label className="text-sm font-medium text-gray-500">Business Name</label>
                                    <p className="text-lg">{user.businessName}</p>
                                </div>
                            )}
                        </div>
                        <div className="mt-6">
                            <Button variant="outline">
                                Edit Profile
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Requests
                            </CardTitle>
                            <User className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">12</div>
                            <p className="text-xs text-muted-foreground">
                                +2 from last month
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Total Cost
                            </CardTitle>
                            <DollarSign className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">$1,234</div>
                            <p className="text-xs text-muted-foreground">
                                +$200 from last month
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Pending Requests
                            </CardTitle>
                            <Clock className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">3</div>
                            <p className="text-xs text-muted-foreground">
                                Currently active
                            </p>
                        </CardContent>
                    </Card>
                    
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">
                                Completed Requests
                            </CardTitle>
                            <CheckCircle className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">9</div>
                            <p className="text-xs text-muted-foreground">
                                75% completion rate
                            </p>
                        </CardContent>
                    </Card>
                </div>

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                        <CardDescription>
                            Your latest service requests and updates
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Towing service completed
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Your vehicle was successfully towed to the repair shop
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    2 hours ago
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        Roadside assistance in progress
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Provider is on the way to your location
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    1 day ago
                                </div>
                            </div>
                            <div className="flex items-center space-x-4">
                                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                <div className="flex-1 space-y-1">
                                    <p className="text-sm font-medium leading-none">
                                        New service request created
                                    </p>
                                    <p className="text-sm text-muted-foreground">
                                        Emergency towing service requested
                                    </p>
                                </div>
                                <div className="text-sm text-muted-foreground">
                                    3 days ago
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
} 