import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from '@clerk/nextjs'
import { Toaster } from "@/components/ui/sonner"

import { RoleProvider } from "@/contexts/role-context"

const outfit = Outfit({
    subsets: ["latin"],
    weight: "400",
});

export const metadata: Metadata = {
    title: "MedFlow - Healthcare Management System",
    description: "Unified healthcare management platform",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <ClerkProvider>
            <html lang="en">
                <body className={`${outfit.className} antialiased`}>
                    <RoleProvider>
                        {children}
                        <Toaster />
                    </RoleProvider>
                </body>
            </html>
        </ClerkProvider>
    );
}
