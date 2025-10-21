import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Footer } from '@/components/Footer';
import { Toaster } from 'react-hot-toast';

export const metadata: Metadata = {
  title: 'Community Modules Viewer',
  description: 'Browse and explore Takaro community and built-in modules',
  keywords: ['Takaro', 'modules', 'gaming', 'server management'],
  authors: [{ name: 'Takaro Community' }],
  creator: 'Takaro',
  publisher: 'Takaro',
  robots: 'index, follow',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://community-modules.takaro.io',
    siteName: 'Community Modules Viewer',
    title: 'Community Modules Viewer',
    description: 'Browse and explore Takaro community and built-in modules',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Community Modules Viewer',
    description: 'Browse and explore Takaro community and built-in modules',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#000000',
  colorScheme: 'dark',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="takaro" className="dark">
      <body className="bg-takaro-background text-white min-h-screen antialiased overflow-x-hidden flex flex-col">
        <div className="min-h-screen bg-gradient-to-br from-takaro-background via-takaro-background to-gray-900 overflow-x-hidden flex flex-col">
          <div className="flex-1">{children}</div>
          <Footer />
        </div>
        <Toaster
          position="top-right"
          toastOptions={{
            // Default styling for all toasts to match Takaro dark theme
            style: {
              background: 'var(--takaro-card)',
              color: 'var(--takaro-text-primary)',
              border: '1px solid var(--takaro-border)',
            },
            // Success toasts
            success: {
              iconTheme: {
                primary: 'var(--takaro-primary)',
                secondary: 'var(--takaro-card)',
              },
            },
            // Error toasts
            error: {
              iconTheme: {
                primary: '#ef4444',
                secondary: 'var(--takaro-card)',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
