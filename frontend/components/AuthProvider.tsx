"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from "react"
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser"
import { Session } from "@supabase/supabase-js"

type AuthContextType = {
  session: Session | null
  user: Session['user'] | undefined
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children, session: initialSession }: { children: ReactNode, session: Session | null }) {
  const [session, setSession] = useState<Session | null>(initialSession)

  useEffect(() => {
    const supabase = createBrowserSupabaseClient()

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    // Ensure we have an initial session even if onAuthStateChange didn't fire
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  return (
    <AuthContext.Provider value={{ session, user: session?.user }}>
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