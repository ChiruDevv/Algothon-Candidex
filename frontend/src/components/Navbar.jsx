"use client";
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { SignInButton, UserButton, useAuth } from '@clerk/nextjs'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  if (!mounted) return <div style={{ width: 32, height: 32 }} />

  return (
    <button
      onClick={() => setTheme(resolvedTheme === 'dark' ? 'light' : 'dark')}
      style={{
        background: 'transparent',
        border: '1px solid var(--border-subtle)',
        borderRadius: 'var(--radius-md)',
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: 'var(--text-secondary)'
      }}
      title="Toggle theme"
    >
      {resolvedTheme === 'dark' ? '☀️' : '🌙'}
    </button>
  )
}

export default function Navbar() {
  const pathname = usePathname()
  const { isLoaded, isSignedIn } = useAuth()

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link href="/" className="navbar-logo">
          <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="logoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#00d4aa" />
                <stop offset="100%" stopColor="#0ea5e9" />
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
          <Link href="/" style={pathname === '/' ? { color: 'var(--text-primary)' } : {}}>
            Home
          </Link>
          
          <div style={{ width: '1px', height: '24px', background: 'var(--border-subtle)', margin: '0 8px' }}></div>
          
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>For Recruiters</span>
          <Link href="/analyze" style={pathname === '/analyze' ? { color: 'var(--text-primary)' } : {}}>
            Analyze
          </Link>
          <Link href="/history" style={pathname === '/history' ? { color: 'var(--text-primary)', marginLeft: '12px' } : { marginLeft: '12px' }}>
            History
          </Link>



          <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '12px', minHeight: '32px' }}>
            <ThemeToggle />
            {isLoaded && !isSignedIn && (
              <SignInButton mode="modal">
                <button className="nav-btn-primary">Sign In</button>
              </SignInButton>
            )}
            {isLoaded && isSignedIn && (
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: {
                      width: '32px',
                      height: '32px'
                    }
                  }
                }}
              />
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
