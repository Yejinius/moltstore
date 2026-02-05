/**
 * Server-side authentication utilities for Supabase Auth
 * Provides helpers for authentication, authorization, and role-based access control
 */

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export type UserRole = 'admin' | 'developer' | 'user'

export interface AuthUser {
  id: string
  email: string
  role: UserRole
  full_name?: string
  developer_verified: boolean
}

/**
 * Get currently authenticated user from server context
 * @returns AuthUser with role information or null if not authenticated
 */
export async function getServerUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    return null
  }

  // Fetch user profile with role
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, full_name, developer_verified')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    full_name: profile.full_name,
    developer_verified: profile.developer_verified,
  }
}

/**
 * Require user to have specific role(s)
 * @param role Single role or array of allowed roles
 * @returns AuthUser if authorized, null otherwise
 */
export async function requireRole(role: UserRole | UserRole[]): Promise<AuthUser | null> {
  const user = await getServerUser()

  if (!user) {
    return null
  }

  const allowedRoles = Array.isArray(role) ? role : [role]

  if (!allowedRoles.includes(user.role)) {
    return null
  }

  return user
}

/**
 * Higher-order function to protect API routes with authentication
 * @param handler The request handler that requires authentication
 * @param options Options for role-based access control
 * @returns Protected request handler
 */
export function withAuth(
  handler: (request: NextRequest, user: AuthUser) => Promise<NextResponse>,
  options?: { requiredRole?: UserRole | UserRole[] }
) {
  return async (request: NextRequest, context?: any) => {
    const user = options?.requiredRole
      ? await requireRole(options.requiredRole)
      : await getServerUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // Pass context as second parameter if it exists (for dynamic routes)
    return handler(request, user)
  }
}

/**
 * Extract user from request (for API routes with Bearer token)
 * @param request NextRequest object
 * @returns AuthUser or null if not authenticated
 */
export async function getUserFromRequest(request: NextRequest): Promise<AuthUser | null> {
  // First try to get from cookies (session-based auth)
  const cookieHeader = request.headers.get('cookie')

  if (cookieHeader) {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            const cookies = cookieHeader.split(';').map(c => c.trim())
            const cookie = cookies.find(c => c.startsWith(`${name}=`))
            return cookie?.split('=')[1]
          },
        },
      }
    )

    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('user_profiles')
        .select('role, full_name, developer_verified')
        .eq('id', user.id)
        .single()

      if (profile) {
        return {
          id: user.id,
          email: user.email!,
          role: profile.role as UserRole,
          full_name: profile.full_name,
          developer_verified: profile.developer_verified,
        }
      }
    }
  }

  // Fallback to Bearer token (for API key authentication)
  const authHeader = request.headers.get('authorization')

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null
  }

  const token = authHeader.substring(7)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get() { return undefined },
      },
    }
  )

  const { data: { user }, error } = await supabase.auth.getUser(token)

  if (error || !user) {
    return null
  }

  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role, full_name, developer_verified')
    .eq('id', user.id)
    .single()

  if (!profile) {
    return null
  }

  return {
    id: user.id,
    email: user.email!,
    role: profile.role as UserRole,
    full_name: profile.full_name,
    developer_verified: profile.developer_verified,
  }
}

/**
 * Check if user has specific role (helper function)
 * @param user AuthUser object
 * @param role Required role or array of roles
 * @returns true if user has the role
 */
export function hasRole(user: AuthUser | null, role: UserRole | UserRole[]): boolean {
  if (!user) return false

  const allowedRoles = Array.isArray(role) ? role : [role]
  return allowedRoles.includes(user.role)
}
