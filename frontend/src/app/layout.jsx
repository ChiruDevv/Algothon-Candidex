import { ThemeProvider } from '@/components/ThemeProvider'
import './globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'Candidex',
  description: 'AI Resume & Job Matching System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
          <Navbar />
          <div className="page-content">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  )
}