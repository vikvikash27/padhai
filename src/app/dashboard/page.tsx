import React from 'react'
import { createClient } from '@/utils/supabase/server'
import { signOut } from '@/app/auth/actions'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <main className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-md p-6 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <p className="text-zinc-400 text-sm">
          Welcome, <span className="text-zinc-200">{user?.email}</span>
        </p>
        <form action={signOut}>
          <button
            type="submit"
            className="w-full py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-100 rounded-lg text-sm font-medium transition-all"
          >
            Sign Out
          </button>
        </form>
      </div>
    </main>
  )
}
