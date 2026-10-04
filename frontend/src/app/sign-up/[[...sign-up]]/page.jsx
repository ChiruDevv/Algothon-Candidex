"use client";
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { createClient } from '@/utils/supabase/client'

export default function SignUp() {
  const supabase = createClient()

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 'calc(100vh - 80px)', paddingTop: '80px' }}>
      <div style={{ width: '100%', maxWidth: '400px', background: 'var(--bg-card)', padding: '32px', borderRadius: '12px', border: '1px solid var(--border-default)' }}>
        <h2 style={{ textAlign: 'center', marginBottom: '24px', color: 'var(--text-primary)' }}>Create an Account</h2>
        <Auth
          supabaseClient={supabase}
          appearance={{
            theme: ThemeSupa,
            variables: {
              default: {
                colors: {
                  brand: '#00d4aa',
                  brandAccent: '#0ea5e9',
                },
              },
            },
          }}
          redirectTo={`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/analyze`}
          view="sign_up"
        />
      </div>
    </div>
  )
}
