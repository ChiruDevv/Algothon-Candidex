"use client";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function SignIn() {
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session) {
        window.location.href = '/'
      }
    })
    return () => subscription.unsubscribe()
  }, [supabase.auth, router])

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', paddingTop: '80px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-card)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
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
          redirectTo={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/`}
          view="sign_in"
        />
      </div>
    </div>
  )
}
