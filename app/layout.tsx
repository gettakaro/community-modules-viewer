import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="takaro">
      <body className="bg-takaro-background min-h-screen">{children}</body>
    </html>
  );
}
