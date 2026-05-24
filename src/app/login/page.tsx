import React from 'react'
import { LoginForm } from './login-form'

interface PageProps {
  searchParams: Promise<{
    error?: string
    message?: string
  }>
}

export default async function LoginPage({ searchParams }: PageProps) {
  const resolvedSearchParams = await searchParams

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-950 px-4 relative overflow-hidden">
      {/* Background radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.03),transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(6,182,212,0.02),transparent_50%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom,rgba(139,92,246,0.02),transparent_50%)] pointer-events-none" />

      <LoginForm
        initialError={resolvedSearchParams.error}
        initialMessage={resolvedSearchParams.message}
      />
    </main>
  )
}
