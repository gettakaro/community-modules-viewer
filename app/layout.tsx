import type { Metadata, Viewport } from 'next';
import './globals.css';

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
      <body className="bg-takaro-background text-white min-h-screen antialiased overflow-x-hidden">
        <div className="min-h-screen bg-gradient-to-br from-takaro-background via-takaro-background to-gray-900 overflow-x-hidden">
          {children}
        </div>
      </body>
    </html>
  );
}
