import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { OrganizationProvider } from "@/components/OrganizationProvider";
import { NotificationProvider } from "@/components/NotificationProvider";

export const metadata: Metadata = {
    title: "DevFlow",
    description: "Work. Align. Deliver.",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            data-scroll-behavior="smooth"
        >
            <body>
                <AuthProvider>
                    <OrganizationProvider>
                        <NotificationProvider>
                            {children}
                        </NotificationProvider>
                    </OrganizationProvider>
                </AuthProvider>
            </body>
        </html>
    );
}