import '../app/globals.css'
import Navbar from '@/components/Navbar'

export const metadata = {
  title: 'HirePilot AI',
  description: 'AI Resume & Job Matching System',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <div className="page-content">
          {children}
        </div>
      </body>
    </html>
  )
}