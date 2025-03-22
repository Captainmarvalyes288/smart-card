import './globals.css'

export const metadata = {
  title: 'Smart Card Payment System',
  description: 'A school payment system using smart cards',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-50">
        {children}
      </body>
    </html>
  )
}
