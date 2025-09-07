"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser"
import { Session } from "@supabase/supabase-js"

type AuthContextType = {
  session: Session | null
  user: Session['user'] | null
  isAdmin: boolean | null
}

const AuthContext = createContext<AuthContextType & { refreshSession: () => Promise<void> } | undefined>(undefined)

export function AuthProvider({ children, session: initialSession }: { children: ReactNode, session: Session | null }) {
  const [session, setSession] = useState<Session | null>(initialSession)
  const [user, setUser] = useState<Session['user'] | null>(null)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  console.log('🔍 AuthProvider render - session:', !!session, 'user:', !!user, 'isAdmin:', isAdmin)

  useEffect(() => {
    console.log('🚀 AuthProvider useEffect started')
    const supabase = createBrowserSupabaseClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔄 Auth state changed:', event, 'Session exists:', !!session, 'Session ID:', session?.user?.id)
      setSession(session)
      if (session) {
        console.log('👤 Session found, getting user...')
        try {
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          if (userError || !user) {
            console.warn('❌ Error getting user:', userError)
            setUser(null)
            setIsAdmin(null)
            return
          }

          console.log('✅ User found:', user.id, user.email)
          setUser(user)

          console.log('🔍 Fetching profile for user:', user.id)
          const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .maybeSingle()

          console.log('📊 Profile query result - data:', data, 'error:', error)

          if (error) {
            console.warn('⚠️ AuthProvider: Error fetching profile:', error)
            setIsAdmin(false)
          } else if (!data) {
            console.log('❌ No profile found for user')
            setIsAdmin(false)
          } else {
            console.log('✅ Profile found, is_admin:', data.is_admin)
            setIsAdmin(data.is_admin === true)
          }
        } catch (err) {
          console.warn('💥 AuthProvider: Unexpected error:', err)
          setIsAdmin(false)
        }
      } else {
        console.log('🚫 No session, clearing user data')
        setUser(null)
        setIsAdmin(null)
      }
    })

    const initializeAuth = async () => {
      console.log('🔧 Initializing auth...')
      try {
        const { data: { session } } = await supabase.auth.getSession()
        console.log('📋 Initial session check:', !!session)
        setSession(session)
        if (session) {
          const { data: { user }, error: userError } = await supabase.auth.getUser()
          if (userError || !user) {
            console.warn('❌ Init: Error getting user:', userError)
            setUser(null)
            setIsAdmin(null)
            return
          }
          
          console.log('✅ Init: User found:', user.id, user.email)
          setUser(user)
          
          console.log('🔍 Init: Fetching profile for user:', user.id)
          const { data, error } = await supabase
            .from('profiles')
            .select('is_admin')
            .eq('id', user.id)
            .maybeSingle()
          
          console.log('📊 Init: Profile query result - data:', data, 'error:', error)
          
          if (error) {
            console.warn('⚠️ AuthProvider:init: Error fetching profile:', error)
            setIsAdmin(false)
          } else if (!data) {
            console.log('❌ Init: No profile found for user')
            setIsAdmin(false)
          } else {
            console.log('✅ Init: Profile found, is_admin:', data.is_admin)
            setIsAdmin(data.is_admin === true)
          }
        }
      } catch (err) {
        console.warn('💥 AuthProvider:init: Error initializing auth:', err)
      }
    }
    
    initializeAuth()

    return () => subscription.unsubscribe()
  }, [])

  const refreshSession = async () => {
    console.log('🔄 Refreshing session...')
    const supabase = createBrowserSupabaseClient()
    try {
      const { data: { session } } = await supabase.auth.getSession()
      console.log('📋 Session refresh result:', !!session)
      setSession(session)
      if (session) {
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        if (userError || !user) {
          console.warn('❌ Refresh: Error getting user:', userError)
          setUser(null)
          setIsAdmin(null)
          return
        }
        
        console.log('✅ Refresh: User found:', user.id, user.email)
        setUser(user)
        
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .maybeSingle()
        
        if (error) {
          console.warn('⚠️ Refresh: Error fetching profile:', error)
          setIsAdmin(false)
        } else if (!data) {
          console.log('❌ Refresh: No profile found for user')
          setIsAdmin(false)
        } else {
          console.log('✅ Refresh: Profile found, is_admin:', data.is_admin)
          setIsAdmin(data.is_admin === true)
        }
      } else {
        setUser(null)
        setIsAdmin(null)
      }
    } catch (err) {
      console.warn('💥 Error refreshing session:', err)
    }
  }

  return (
    <AuthContext.Provider value={{ session, user, isAdmin, refreshSession }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}