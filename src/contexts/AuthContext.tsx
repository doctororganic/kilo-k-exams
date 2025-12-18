import React, { createContext, useContext, useEffect, useState, useCallback } from 'react'
import type { User } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { logger, authLogger } from '../utils/logger'
import { handleAsyncError, AuthenticationError, NetworkError, DatabaseError } from '../utils/errorHandler'

interface AuthContextType {
  user: User | null
  loading: boolean
  error: string | null
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, grade: string) => Promise<void>
  signOut: () => Promise<void>
  clearError: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Initialize guest user
  const initializeGuestUser = useCallback(() => {
    try {
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
      authLogger.info('Guest user initialized', { guestId })
    } catch (error) {
      authLogger.error('Failed to initialize guest user', { error })
      setError('فشل في تهيئة المستخدم الضيف')
    }
  }, [])

  useEffect(() => {
    initializeGuestUser()
    setLoading(false)
  }, [initializeGuestUser])

  const fetchUserProfile = useCallback(async (userId: string) => {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', userId)
      .single()
    
    if (error) {
      throw new DatabaseError(`Failed to fetch user profile: ${error.message}`, 'FETCH_USER_PROFILE')
    }
    
    return { data, error }
  }, [])

  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setLoading(true)
      setError(null)
      
      authLogger.info('Attempting sign in', { email })
      
      const { data, error: signInError } = await handleAsyncError(
        supabase.auth.signInWithPassword({ email, password }),
        'SIGN_IN'
      )
      
      if (signInError) {
        throw new AuthenticationError(signInError.message, 'SIGN_IN')
      }
      
      if (data.user) {
        authLogger.info('Sign in successful', { userId: data.user.id })
        // Fetch user profile
        try {
          const profile = await fetchUserProfile(data.user.id)
          if (profile.data) {
            setUser(profile.data as User)
          }
        } catch (profileError) {
          authLogger.warn('Failed to fetch user profile after sign in', { profileError })
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل في تسجيل الدخول'
      setError(errorMessage)
      authLogger.error('Sign in failed', { email, error })
      throw error
    } finally {
      setLoading(false)
    }
  }, [fetchUserProfile])

  const signUp = useCallback(async (email: string, password: string, name: string, grade: string) => {
    try {
      setLoading(true)
      setError(null)
      
      authLogger.info('Attempting sign up', { email, name, grade })
      
      const { data, error: signUpError } = await handleAsyncError(
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              name,
              grade_level: grade,
            },
          },
        }),
        'SIGN_UP'
      )
      
      if (signUpError) {
        throw new AuthenticationError(signUpError.message, 'SIGN_UP')
      }
      
      if (data.user) {
        authLogger.info('Sign up successful', { userId: data.user.id })
        // Create user profile
        const userProfile: Omit<User, 'created_at' | 'updated_at'> = {
          user_id: data.user.id,
          email: data.user.email!,
          name,
          grade_level: grade,
        }
        
        const { error: profileError } = await supabase
          .from('users')
          .insert([userProfile])
        
        if (profileError) {
          throw new DatabaseError(`Failed to create user profile: ${profileError.message}`, 'CREATE_USER_PROFILE')
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل في إنشاء الحساب'
      setError(errorMessage)
      authLogger.error('Sign up failed', { email, name, grade, error })
      throw error
    } finally {
      setLoading(false)
    }
  }, [])

  const signOut = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      
      authLogger.info('Signing out user')
      
      await supabase.auth.signOut()
      
      // Initialize new guest user
      initializeGuestUser()
      authLogger.info('Sign out successful, new guest user created')
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'فشل في تسجيل الخروج'
      setError(errorMessage)
      authLogger.error('Sign out failed', { error })
      
      // Even if sign out fails, reset to guest user
      initializeGuestUser()
    } finally {
      setLoading(false)
    }
  }, [initializeGuestUser])

  const clearError = useCallback(() => {
    setError(null)
  }, [])

  const value = {
    user,
    loading,
    error,
    signIn,
    signUp,
    signOut,
    clearError,
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
