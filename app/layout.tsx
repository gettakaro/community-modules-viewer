import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
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
  other: {
    'darkreader-lock': '', // Disable Dark Reader to prevent hydration errors
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
      <Script id="posthog-init" strategy="afterInteractive">{`
        !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}(p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host.replace(".i.posthog.com","-assets.i.posthog.com")+"/static/array.js",(r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},o="init capture register register_once register_for_session unregister unregister_for_session getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey getNextSurveyStep identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty createPersonProfile opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing debug".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
        posthog.init('phc_o2UIUo74OFNwMHi5FXLey8jQed5pHsMj0Vwf8ThvuPq', {
          api_host: 'https://eu.i.posthog.com',
          person_profiles: 'identified_only',
        });
      `}</Script>
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
