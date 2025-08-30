"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser"
import { Session } from "@supabase/supabase-js"

type AuthContextType = {
  session: Session | null
  user: Session['user'] | undefined
  isAdmin: boolean | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, session: initialSession }: { children: ReactNode, session: Session | null }) {
  const [session, setSession] = useState<Session | null>(initialSession)
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setSession(session)
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()
        if (error) {
          console.error('Error fetching profile:', error)
          setIsAdmin(false)
        } else {
          setIsAdmin(data.is_admin)
        }
      } else {
        setIsAdmin(null)
      }
    })

    // Ensure we have an initial session even if onAuthStateChange didn't fire
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setSession(session)
      if (session) {
        const { data, error } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', session.user.id)
          .single()
        if (error) {
          console.error('Error fetching profile:', error)
          setIsAdmin(false)
        } else {
          setIsAdmin(data.is_admin)
        }
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: session?.user, isAdmin }}>
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