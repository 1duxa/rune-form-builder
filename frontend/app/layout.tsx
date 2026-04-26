import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Form Editor - Dynamic Form Builder',
  description: 'Dynamic form builder with C# business logic runtime',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans antialiased`}>
        <header className="border-b bg-background">
          <nav className="mx-auto max-w-7xl px-4 py-3 flex gap-6 text-sm">
            <a href="/" className="hover:underline font-medium">Home</a>
            <a href="/form-editor" className="hover:underline">FormEditor</a>
            <a href="/weather" className="hover:underline">Weather</a>
            <a href="/tables" className="hover:underline">Tables</a>
          </nav>
        </header>
        <main className="mx-auto max-w-7xl px-4 py-6">
          {children}
        </main>
      </body>
    </html>
  )
}
