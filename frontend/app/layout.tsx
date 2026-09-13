import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { OrganizationProvider } from "@/components/OrganizationProvider";

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
                        {children}
                    </OrganizationProvider>
                </AuthProvider>
            </body>
        </html>
    );
}