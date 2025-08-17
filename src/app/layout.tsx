import type {Metadata} from 'next';
// import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';

// const geistSans = Geist({
//     variable: '--font-geist-sans',
//     subsets: ['latin'],
// });

// const geistMono = Geist_Mono({
//     variable: '--font-geist-mono',
//     subsets: ['latin'],
// });

export const metadata: Metadata = {
    title: 'Phil Barera Portfolio Site',
    description:
        'Results-driven Software Engineer with 8+ years, specializing in performant, scalable React/Next.js applications, full-stack architecture, and technical leadership',
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            {/* ${geistSans.variable} ${geistMono.variable} */}
            <body className={`antialiased`}>{children}</body>
        </html>
    );
}
