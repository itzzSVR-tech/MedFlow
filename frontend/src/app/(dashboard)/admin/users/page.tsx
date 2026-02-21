"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { mockUsers, type User } from "@/constants/mock-data"
import { toast } from "sonner"
import { Search } from "lucide-react"

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>(mockUsers)
    const [searchQuery, setSearchQuery] = useState("")

    const handleToggleStatus = (userId: string) => {
        setUsers(prev =>
            prev.map(user =>
                user.id === userId
                    ? { ...user, status: user.status === "Active" ? "Suspended" : "Active" }
                    : user
            )
        )
        const user = users.find(u => u.id === userId)
        toast.success(
            user?.status === "Active" ? "User suspended" : "User reactivated",
            { description: `${user?.name}'s account has been updated.` }
        )
    }

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const getRoleBadge = (role: User['role']) => {
        const colors = {
            Admin: "bg-purple-100 text-purple-700 border-purple-200",
            Doctor: "bg-blue-100 text-blue-700 border-blue-200",
            Patient: "bg-green-100 text-green-700 border-green-200",
        }
        return colors[role]
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-900">User Management</h2>
                <p className="text-slate-500 mt-1">Manage system users and account status</p>
            </div>

            {/* Search Bar */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                    placeholder="Search users by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                />
            </div>

            {/* Users List */}
            <div className="space-y-4">
                {filteredUsers.map((user) => (
                    <Card key={user.id} className="border-slate-200">
                        <CardHeader>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={`https://i.pravatar.cc/150?u=${user.id}`} />
                                        <AvatarFallback>{user.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <CardTitle className="text-lg">{user.name}</CardTitle>
                                        <CardDescription>{user.email}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Badge className={getRoleBadge(user.role)}>
                                        {user.role}
                                    </Badge>
                                    <Badge
                                        variant={user.status === "Active" ? "default" : "outline"}
                                        className={
                                            user.status === "Active"
                                                ? "bg-green-100 text-green-700 border-green-200"
                                                : "bg-red-100 text-red-700 border-red-200"
                                        }
                                    >
                                        {user.status}
                                    </Badge>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center justify-between">
                                <div className="grid grid-cols-2 gap-6 flex-1">
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Last Active</p>
                                        <p className="text-sm text-slate-900">{user.lastActive}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-slate-500">Account Status</p>
                                        <div className="flex items-center gap-2 mt-1">
                                            <Switch
                                                checked={user.status === "Active"}
                                                onCheckedChange={() => handleToggleStatus(user.id)}
                                                disabled={user.role === "Admin"}
                                            />
                                            <span className="text-sm text-slate-700">
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
                <Card className="border-slate-200">
                    <CardContent className="flex items-center justify-center py-16 text-slate-500">
                        No users found matching your search.
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
