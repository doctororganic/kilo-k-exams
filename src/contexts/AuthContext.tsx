import React, { createContext, useContext, useEffect, useState } from 'react'
import type { User } from '../lib/supabase'

interface AuthContextType {
  user: User | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, grade: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const existing = localStorage.getItem('guest_user_id')
    const guestId = existing || (crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)
    if (!existing) localStorage.setItem('guest_user_id', guestId)

    const guestUser: User = {
      user_id: guestId,
      email: 'guest@local',
      name: 'زائر',
      grade_level: '10',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }
    setUser(guestUser)
    setLoading(false)
  }, [])

  const fetchUserProfile = async (_userId: string) => {}

  const signIn = async (_email: string, _password: string) => {}

  const signUp = async (_email: string, _password: string, _name: string, _grade: string) => {}

  const signOut = async () => {
    const newId = crypto && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`
    localStorage.setItem('guest_user_id', newId)
    setUser({
      user_id: newId,
      email: 'guest@local',
      name: 'زائر',
      grade_level: '10',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
