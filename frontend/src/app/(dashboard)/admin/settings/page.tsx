"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Bell, Shield, Database, Globe, Loader2, Save, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import api from "@/lib/api"
import { toast } from "sonner"

interface Settings {
    hospital_name: string
    timezone: string
    notifications_enabled: boolean
    surge_alert_threshold: number
}

const DEFAULT_SETTINGS: Settings = {
    hospital_name: "",
    timezone: "Asia/Kolkata",
    notifications_enabled: true,
    surge_alert_threshold: 80,
}

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS)

    const fetchSettings = useCallback(async () => {
        try {
            setLoading(true)
            const { data } = await api.get("/admin/settings")
            const s = data.data ?? data
            setSettings({
                hospital_name: s.hospital_name || "",
                timezone: s.timezone || "Asia/Kolkata",
                notifications_enabled: s.notifications_enabled ?? true,
                surge_alert_threshold: s.surge_alert_threshold ?? 80,
            })
        } catch (err: any) {
            toast.error("Failed to load settings")
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchSettings()
    }, [fetchSettings])

    const handleSave = async () => {
        try {
            setSaving(true)
            await api.put("/admin/settings", settings)
            setSaved(true)
            toast.success("Settings saved successfully!")
            setTimeout(() => setSaved(false), 3000)
        } catch (err: any) {
            const msg = err?.response?.data?.error || err.message
            toast.error(`Failed to save settings: ${msg}`)
        } finally {
            setSaving(false)
        }
    }

    const update = (key: keyof Settings, value: any) => {
        setSettings(prev => ({ ...prev, [key]: value }))
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
        )
    }

    return (
        <div className="space-y-6 max-w-3xl">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Settings</h2>
                    <p className="text-sm text-gray-500 mt-0.5">System configuration and preferences</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={saving}
                    className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 gap-2 shadow-lg shadow-blue-100"
                >
                    {saving ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : saved ? (
                        <CheckCircle className="w-4 h-4" />
                    ) : (
                        <Save className="w-4 h-4" />
                    )}
                    {saved ? "Saved!" : saving ? "Saving…" : "Save Changes"}
                </Button>
            </div>

            {/* General / Hospital */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Globe className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-semibold text-gray-900">General</CardTitle>
                            <CardDescription className="text-xs">Hospital name and regional settings</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Hospital Name</label>
                        <input
                            type="text"
                            value={settings.hospital_name}
                            onChange={(e) => update("hospital_name", e.target.value)}
                            placeholder="e.g. City General Hospital"
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">Timezone</label>
                        <select
                            value={settings.timezone}
                            onChange={(e) => update("timezone", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all bg-white"
                        >
                            <option value="Asia/Kolkata">Asia/Kolkata (IST, UTC+5:30)</option>
                            <option value="UTC">UTC</option>
                            <option value="America/New_York">America/New York (EST)</option>
                            <option value="Europe/London">Europe/London (GMT)</option>
                            <option value="Asia/Dubai">Asia/Dubai (GST)</option>
                            <option value="Asia/Singapore">Asia/Singapore (SGT)</option>
                        </select>
                    </div>
                </CardContent>
            </Card>

            {/* Notifications */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Bell className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-semibold text-gray-900">Notifications</CardTitle>
                            <CardDescription className="text-xs">Alert thresholds and alerting preferences</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 border border-gray-100">
                        <div>
                            <p className="text-sm font-bold text-gray-700">Enable Notifications</p>
                            <p className="text-xs text-gray-400">Surge alerts, staff overload warnings</p>
                        </div>
                        <button
                            onClick={() => update("notifications_enabled", !settings.notifications_enabled)}
                            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${settings.notifications_enabled ? "bg-blue-600" : "bg-gray-300"}`}
                        >
                            <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${settings.notifications_enabled ? "translate-x-6" : "translate-x-1"}`} />
                        </button>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5 block">
                            Surge Alert Threshold: <span className="text-blue-600">{settings.surge_alert_threshold}%</span>
                        </label>
                        <input
                            type="range"
                            min={50}
                            max={100}
                            step={5}
                            value={settings.surge_alert_threshold}
                            onChange={(e) => update("surge_alert_threshold", parseInt(e.target.value))}
                            className="w-full accent-blue-600"
                        />
                        <div className="flex justify-between text-xs text-gray-400 mt-1">
                            <span>50%</span>
                            <span>75%</span>
                            <span>100%</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Access Control (display only) */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm opacity-60">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Shield className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-semibold text-gray-900">Access Control</CardTitle>
                            <CardDescription className="text-xs">Role mutation is permanently disabled. Assign roles at user creation only.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="px-4 py-3 rounded-xl bg-amber-50 border border-amber-100">
                        <p className="text-xs text-amber-700 font-bold">⚠ Role Immutability Enforced</p>
                        <p className="text-xs text-amber-600 mt-0.5">User roles cannot be changed after account creation. This is a system-level security constraint.</p>
                    </div>
                </CardContent>
            </Card>

            {/* Data & Integrations (display only) */}
            <Card className="rounded-2xl border border-gray-100 shadow-sm opacity-60">
                <CardHeader className="pb-3">
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                            <Database className="h-5 w-5" />
                        </div>
                        <div>
                            <CardTitle className="text-sm font-semibold text-gray-900">Data & Integrations</CardTitle>
                            <CardDescription className="text-xs">API and data refresh configuration — managed at the infrastructure level.</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="space-y-2">
                        {["API Base URL: /api", "Data Refresh: Live (Supabase Realtime)", "Audit Logging: Enabled"].map(item => (
                            <div key={item} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-100">
                                <span className="text-xs text-gray-700 font-medium">{item}</span>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
