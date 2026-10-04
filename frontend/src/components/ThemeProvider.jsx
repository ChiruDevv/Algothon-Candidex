"use client";

import * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"
import { ClerkProvider } from "@clerk/nextjs"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

export function ThemeProvider({ children, ...props }) {
  return (
    <NextThemesProvider {...props}>
      <ClerkProviderWrapper>
        {children}
      </ClerkProviderWrapper>
    </NextThemesProvider>
  )
}

function ClerkProviderWrapper({ children }) {
  const { resolvedTheme } = useTheme()

  return (
    <ClerkProvider
      appearance={{
        baseTheme: resolvedTheme === 'dark' ? dark : undefined,
        variables: {
          colorPrimary: '#00d4aa'
        },
        elements: {
          card: {
            boxShadow: '0 10px 40px -10px rgba(0,212,170,0.15)',
            border: '1px solid rgba(0, 212, 170, 0.2)'
          }
        }
      }}
    >
      {children}
    </ClerkProvider>
  )
}
