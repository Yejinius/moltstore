/**
 * Client-side authentication context for React components
 * Provides auth state management and authentication methods
 */

'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase-client'
import { User } from '@supabase/supabase-js'
import { AuthUser, UserRole } from '@/lib/auth-supabase'

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, role: 'developer' | 'user') => Promise<void>
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  const fetchUserProfile = async (supabaseUser: User) => {
    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role, full_name, developer_verified')
      .eq('id', supabaseUser.id)
      .single()

    if (error) {
      console.error('Error fetching user profile:', error)
      setUser(null)
      return
    }

    if (profile) {
      setUser({
        id: supabaseUser.id,
        email: supabaseUser.email!,
        role: profile.role as UserRole,
        full_name: profile.full_name,
        developer_verified: profile.developer_verified,
      })
    }
  }

  const refreshUser = async () => {
    const { data: { user: supabaseUser } } = await supabase.auth.getUser()
    if (supabaseUser) {
      await fetchUserProfile(supabaseUser)
    } else {
      setUser(null)
    }
  }

  useEffect(() => {
    // Check active sessions
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        if (session?.user) {
          await fetchUserProfile(session.user)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('Error getting session:', error)
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        await fetchUserProfile(session.user)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => subscription.unsubscribe()
  }, [])

  const signIn = async (email: string, password: string) => {
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Sign in timed out. Please check your connection.')), 15000)
    })

    const signInPromise = supabase.auth.signInWithPassword({ email, password })

    const { error } = await Promise.race([signInPromise, timeoutPromise]) as any
    if (error) throw error
  }

  const signUp = async (email: string, password: string, fullName: string, role: 'developer' | 'user') => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

/**
 * Hook to access auth context
 * Must be used within AuthProvider
 */
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
