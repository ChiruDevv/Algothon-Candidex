"use client";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

export default function UpdatePassword() {
  const supabase = createClient()
  const router = useRouter()
  const [message, setMessage] = useState('')

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'PASSWORD_RECOVERY') {
        setMessage('Please enter your new password below.')
      } else if (event === 'USER_UPDATED') {
        // Password was successfully updated
        setMessage('Password updated successfully! Redirecting...')
        setTimeout(() => {
          window.location.href = '/'
        }, 2000)
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase, router])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', paddingTop: '80px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-card)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-primary)' }}>Update Password</h2>
        {message && <p style={{ textAlign: 'center', color: '#00d4aa', marginBottom: '16px' }}>{message}</p>}
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#00d4aa',
                  brandAccent: '#0ea5e9',
                  inputText: '#ffffff',
                  inputLabelText: 'var(--text-secondary)',
                  inputPlaceholder: 'var(--text-muted)'
                },
              },
            },
          }}
          providers={[]}
          view="update_password"
        />
      </div>
    </div>
  )
}
