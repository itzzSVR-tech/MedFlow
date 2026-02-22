"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface StatusGlowProps {
    status: "waiting" | "in_progress" | "completed" | "critical" | "warning" | "available" | "full"
    children: React.ReactNode
    className?: string
    showGlow?: boolean
}

export function StatusGlow({ status, children, className, showGlow = true }: StatusGlowProps) {
    const getStatusConfig = () => {
        switch (status) {
            case "waiting":
                return {
                    glow: "bg-yellow-400/20",
                    border: "border-yellow-200",
                    dots: "bg-yellow-500",
                    animate: { scale: [1, 1.05, 1] }
                }
            case "in_progress":
                return {
                    glow: "bg-blue-400/30",
                    border: "border-blue-300 shadow-[0_0_15px_rgba(59,130,246,0.3)]",
                    dots: "bg-blue-500",
                    animate: { scale: [1, 1.02, 1] }
                }
            case "completed":
                return {
                    glow: "bg-green-400/10",
                    border: "border-green-200",
                    dots: "bg-green-500",
                    animate: {}
                }
            case "critical":
                return {
                    glow: "bg-red-500/40",
                    border: "border-red-400 shadow-[0_0_20px_rgba(239,68,68,0.4)]",
                    dots: "bg-red-600",
                    animate: { scale: [1, 1.08, 1], opacity: [0.7, 1, 0.7] }
                }
            case "warning":
                return {
                    glow: "bg-orange-400/20",
                    border: "border-orange-200",
                    dots: "bg-orange-500",
                    animate: { opacity: [0.8, 1, 0.8] }
                }
            case "available":
                return {
                    glow: "bg-emerald-400/10",
                    border: "border-emerald-100",
                    dots: "bg-emerald-500",
                    animate: {}
                }
            case "full":
                return {
                    glow: "bg-rose-500/30",
                    border: "border-rose-300 shadow-[0_0_12px_rgba(244,63,94,0.3)]",
                    dots: "bg-rose-600",
                    animate: { scale: [1, 1.03, 1] }
                }
            default:
                return { glow: "", border: "", dots: "", animate: {} }
        }
    }

    const config = getStatusConfig()

    return (
        <div className={cn("relative inline-flex items-center group", className)}>
            {showGlow && status !== "available" && status !== "completed" && (
                <motion.div
                    layoutId={`glow-${status}`}
                    className={cn("absolute -inset-2 rounded-full blur-xl z-0 pointer-events-none", config.glow)}
                    animate={config.animate}
                    transition={{
                        duration: status === "critical" ? 1.5 : 3,
                        repeat: Infinity,
                        ease: "easeInOut"
                    }}
                />
            )}
            <div className={cn("relative z-10 flex items-center gap-2", className)}>
                {children}
                {status !== "completed" && (
                    <motion.span
                        className={cn("w-1.5 h-1.5 rounded-full", config.dots)}
                        animate={status === "critical" ? { opacity: [0, 1, 0] } : {}}
                        transition={{ duration: 1, repeat: Infinity }}
                    />
                )}
            </div>
        </div>
    )
}
