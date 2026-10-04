import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#6c63ff" />
                <stop offset="100%" stopColor="#00d4aa" />
              </linearGradient>
            </defs>
            <rect width="32" height="32" rx="8" fill="url(#logoGrad)" opacity="0.15" />
            <path d="M8 10h16M8 16h12M8 22h8" stroke="url(#logoGrad)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx="24" cy="20" r="5" stroke="url(#logoGrad)" strokeWidth="2" />
            <path d="M27.5 23.5L30 26" stroke="url(#logoGrad)" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <span className="logo-text-gradient">HirePilot AI</span>
        </Link>

        <div className="navbar-links">
          <Link to="/" style={location.pathname === '/' ? { color: 'var(--text-primary)' } : {}}>
            Home
          </Link>
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)', margin: '0 8px' }}></div>
          
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>For Recruiters</span>
          <Link to="/analyze" style={location.pathname === '/analyze' ? { color: 'var(--text-primary)' } : {}}>
            Analyze
          </Link>

          <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)', margin: '0 8px' }}></div>
          
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>For Candidates</span>
          <Link to="/candidate" style={location.pathname.startsWith('/candidate') ? { color: 'var(--text-primary)' } : {}}>
            Portal
          </Link>

          {location.pathname === '/' && (
            <Link to="/analyze" className="nav-btn-primary" style={{ marginLeft: '12px' }}>
              Get Started →
            </Link>
          )}
        </div>
      </div>
    </nav>
  )
}
