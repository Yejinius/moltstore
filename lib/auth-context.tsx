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
    console.log('[Auth] Fetching user profile for:', supabaseUser.email)
    const startTime = Date.now()

    const { data: profile, error } = await supabase
      .from('user_profiles')
      .select('role, full_name, developer_verified')
      .eq('id', supabaseUser.id)
      .single()

    console.log('[Auth] Profile fetch completed in', Date.now() - startTime, 'ms')

    if (error) {
      console.error('[Auth] Error fetching user profile:', error)
      setUser(null)
      return
    }

    if (profile) {
      console.log('[Auth] Profile loaded, role:', profile.role)
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
    console.log('[Auth] Initializing auth context...')

    // Check active sessions
    supabase.auth.getSession()
      .then(async ({ data: { session } }) => {
        console.log('[Auth] getSession result:', session ? 'has session' : 'no session')
        if (session?.user) {
          await fetchUserProfile(session.user)
        }
        setLoading(false)
      })
      .catch((error) => {
        console.error('[Auth] Error getting session:', error)
        setLoading(false)
      })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('[Auth] Auth state changed:', event, session ? 'has session' : 'no session')
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
    console.log('[Auth] Starting sign in...')
    const startTime = Date.now()

    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password })
      console.log('[Auth] Sign in completed in', Date.now() - startTime, 'ms')

      if (error) {
        console.error('[Auth] Sign in error:', error)
        throw error
      }

      console.log('[Auth] Sign in successful, user:', data.user?.email)
    } catch (err) {
      console.error('[Auth] Sign in exception after', Date.now() - startTime, 'ms:', err)
      throw err
    }
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
