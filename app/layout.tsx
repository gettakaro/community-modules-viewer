import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background dark:bg-dark-background text-text dark:text-dark-text">
        {children}
      </body>
    </html>
  );
}
