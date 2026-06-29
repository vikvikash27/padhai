'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { updateProfile } from '@/app/dashboard/profile/actions'
import { Sparkles, User, GraduationCap, Briefcase, Save } from 'lucide-react'

interface EditProfileFormProps {
  profile: {
    full_name: string | null
    email: string | null
    role: 'Student' | 'Professional' | null
    profession: string | null
    academic_field: string | null
  }
}

export function EditProfileForm({ profile }: EditProfileFormProps) {
  const router = useRouter()
  const [fullName, setFullName] = useState(profile.full_name || '')
  const [role, setRole] = useState<'Student' | 'Professional'>(profile.role === 'Professional' ? 'Professional' : 'Student')
  const [profession, setProfession] = useState(profile.profession || '')
  const [academicField, setAcademicField] = useState(profile.academic_field || '')
  
  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [successMsg, setSuccessMsg] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg(null)
    setSuccessMsg(null)

    if (!fullName.trim()) {
      setErrorMsg('Full name is required')
      setLoading(false)
      return
    }

    if (role === 'Student' && !academicField.trim()) {
      setErrorMsg('Academic field is required for students')
      setLoading(false)
      return
    }

    if (role === 'Professional' && !profession.trim()) {
      setErrorMsg('Profession / job role is required for professionals')
      setLoading(false)
      return
    }

    try {
      const res = await updateProfile({
        fullName,
        role,
        profession: role === 'Professional' ? profession : null,
        academicField: role === 'Student' ? academicField : null,
      })

      if (res.error) {
        setErrorMsg(res.error)
      } else {
        setSuccessMsg('Profile updated successfully!')
        router.refresh()
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-zinc-900/60 border border-zinc-800 p-6 rounded-2xl backdrop-blur-xl relative overflow-hidden">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-purple-500 via-cyan-500 to-emerald-500 opacity-60" />
      
      {errorMsg && (
        <div className="p-3 text-xs text-red-400 bg-red-950/30 border border-red-900/50 rounded-lg text-center">
          {errorMsg}
        </div>
      )}

      {successMsg && (
        <div className="p-3 text-xs text-emerald-400 bg-emerald-950/30 border border-emerald-900/50 rounded-lg text-center">
          {successMsg}
        </div>
      )}

      <div>
        <label htmlFor="email" className="block text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">
          Email Address (Primary Account)
        </label>
        <input
          id="email"
          type="email"
          disabled
          value={profile.email || ''}
          className="w-full px-4 py-3 bg-zinc-955 border border-zinc-850 rounded-xl text-zinc-500 text-sm cursor-not-allowed"
        />
      </div>

      <div>
        <label htmlFor="fullName" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Full Name
        </label>
        <div className="relative">
          <User className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            id="fullName"
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="John Doe"
            className="w-full pl-10 pr-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-purple-500/80 transition-colors animate-none"
          />
        </div>
      </div>

      <div>
        <label htmlFor="role" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
          Role Classification
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as 'Student' | 'Professional')}
          className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-purple-500/80 transition-colors cursor-pointer"
        >
          <option value="Student">Student</option>
          <option value="Professional">Professional</option>
        </select>
      </div>

      <div className="pt-2">
        {role === 'Student' ? (
          <div>
            <label htmlFor="academicField" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Academic Field / Course / Class
            </label>
            <input
              id="academicField"
              type="text"
              required
              value={academicField}
              onChange={(e) => setAcademicField(e.target.value)}
              placeholder="e.g. B.Tech Computer Science, UPSC Aspirant, Grade 12"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-purple-500/80 transition-colors"
            />
          </div>
        ) : (
          <div>
            <label htmlFor="profession" className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider mb-2">
              Profession / Job Role
            </label>
            <input
              id="profession"
              type="text"
              required
              value={profession}
              onChange={(e) => setProfession(e.target.value)}
              placeholder="e.g. Software Engineer, Marketing Lead, Consultant"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-800 rounded-xl text-zinc-100 text-sm focus:outline-none focus:border-purple-500/80 transition-colors"
            />
          </div>
        )}
      </div>

      <div className="pt-4">
        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-600 hover:from-purple-500 hover:to-cyan-500 text-white rounded-xl font-bold shadow-lg shadow-purple-900/30 active:scale-[0.98] transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
        >
          {loading ? (
            <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Save className="w-4 h-4" />
              Save Changes
            </>
          )}
        </button>
      </div>
    </form>
  )
}
