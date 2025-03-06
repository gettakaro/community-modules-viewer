import "./globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-background dark:bg-dark-background text-text dark:text-dark-text">
        <script
          defer
          data-domain="takaro.io"
          src="https://plausible.io/js/script.file-downloads.hash.outbound-links.js"
        ></script>
        {children}
      </body>
    </html>
  );
}
