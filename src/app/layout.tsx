import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
    title: "ProjectWizard | Immersive AI Project Initiation",
    description: "Translate your vision into a technical blueprint with AI.",
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en" className="dark">
            <body className={`${inter.variable} font-sans antialiased`}>
                <div className="gradient-bg">
                    <div className="gradient-sphere w-[800px] h-[800px] bg-blue-500 top-[-20%] left-[-10%] animate-pulse-slow" />
                    <div className="gradient-sphere w-[600px] h-[600px] bg-purple-500 bottom-[-10%] right-[-10%] animate-pulse-slow" style={{ animationDelay: '1s' }} />
                </div>
                {children}
            </body>
        </html>
    );
}
