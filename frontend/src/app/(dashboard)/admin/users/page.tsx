"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { toast } from "sonner"
import { Search, Loader2, RefreshCw } from "lucide-react"
import api from "@/lib/api"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface User {
    id: string;
    full_name: string;
    email: string;
    role: "admin" | "doctor" | "patient";
    status: "Active" | "Suspended";
    created_at: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")

    const fetchUsers = async () => {
        try {
            setLoading(true)
            const { data } = await api.get("/admin/users")
            setUsers(data.data ?? data ?? [])
        } catch (err) {
            console.error("Failed to fetch users:", err)
            toast.error("Failed to load users")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchUsers()
    }, [])

    const handleToggleStatus = async (userId: string, currentStatus: string) => {
        const newStatus = currentStatus === "Active" ? "Suspended" : "Active"
        try {
            await api.patch(`/admin/users/${userId}/status`, { status: newStatus })
            setUsers(prev =>
                prev.map(user =>
                    user.id === userId ? { ...user, status: newStatus as any } : user
                )
            )
            toast.success(`User status updated to ${newStatus}`)
        } catch (err) {
            console.error("Failed to update status:", err)
            toast.error("Failed to update user status")
        }
    }

    const filteredUsers = users.filter(user =>
        (user.full_name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (user.email || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getRoleBadge = (role: string) => {
        const colors: Record<string, string> = {
            admin: "bg-purple-100 text-purple-700 border-purple-200",
            doctor: "bg-blue-100 text-blue-700 border-blue-200",
            patient: "bg-green-100 text-green-700 border-green-200",
        }
        return colors[role.toLowerCase()] || "bg-slate-100 text-slate-700"
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                    <p className="text-slate-500 mt-1">Manage system users and account status</p>
                </div>
                <Button variant="outline" size="sm" onClick={fetchUsers} className="rounded-xl flex gap-2 font-bold">
                    <RefreshCw className="w-4 h-4" />
                    Refresh
                </Button>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 h-12 rounded-2xl border-slate-200"
                />
            </div>

            {/* Users List */}
            <div className="space-y-4">
                {filteredUsers.map((user) => (
                    <Card key={user.id} className="border-slate-200 rounded-[2rem] overflow-hidden hover:shadow-md transition-all">
                        <CardHeader className="pb-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-14 w-14 border-2 border-white shadow-sm ring-1 ring-slate-100 text-slate-900">
                                        <AvatarFallback className="bg-slate-100 font-bold uppercase">
                                            {(user.full_name || user.email).substring(0, 2)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-xl font-bold text-slate-900">{user.full_name || user.email.split('@')[0]}</CardTitle>
                                        <CardDescription className="font-medium text-slate-500">{user.email}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={cn("rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider", getRoleBadge(user.role))}>
                                        {user.role}
                                    </Badge>
                                    <Badge
                                        variant={user.status === "Active" ? "default" : "outline"}
                                        className={cn(
                                            "rounded-full px-3 py-1 font-bold text-[10px] uppercase tracking-wider",
                                            user.status === "Active"
                                                ? "bg-green-100 text-green-700 border-green-200"
                                                : "bg-red-100 text-red-700 border-red-200"
                                        )}
                                    >
                                        {user.status || 'Active'}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                <div className="grid grid-cols-2 gap-12 flex-1">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Joined On</p>
                                        <p className="text-sm font-bold text-slate-700 mt-1">{new Date(user.created_at).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Account Status</p>
                                        <div className="flex items-center gap-3 mt-1">
                                            <Switch
                                                checked={user.status === "Active"}
                                                onCheckedChange={() => handleToggleStatus(user.id, user.status || 'Active')}
                                                disabled={user.role === "admin"}
                                                className="data-[state=checked]:bg-green-500"
                                            />
                                            <span className="text-sm font-bold text-slate-600">
                                                {user.status === "Active" ? "Active" : "Suspended"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <Card className="border-slate-200 rounded-[2rem] py-20 bg-slate-50/50 border-dashed">
                    <CardContent className="flex flex-col items-center justify-center text-slate-400">
                        <Search className="h-10 w-10 mb-4 opacity-20" />
                        <p className="font-bold">No users found matching your search.</p>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
