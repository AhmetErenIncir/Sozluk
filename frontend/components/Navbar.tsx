"use client"

import { Button } from "@/components/ui/button"
import { BookOpen, User, LogOut, Home as HomeIcon } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/components/AuthProvider"
import { createBrowserSupabaseClient } from "@/lib/supabaseBrowser"
import { useRouter } from "next/navigation"

export default function Navbar() {
  const { session, user, isAdmin } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    const supabase = createBrowserSupabaseClient()
    
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Logout error:', error)
      } else {
        console.log('Successfully logged out')
      }
      router.refresh()
      router.push('/') // Redirect to home page after logout
    } catch (error) {
      console.error('Unexpected error during logout:', error)
      router.refresh()
    }
  }

  return (
    <nav className="border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">

            <Link href="/" className="flex items-center space-x-2">
              <BookOpen className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">Sozluk</span>
            </Link>
            {session ? (
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {user?.email}
                </span>
                {isAdmin === true && (
                  <Link href="/add-word">
                    <Button variant="ghost">Kelime Ekle</Button>
                  </Link>
                )}
                <Button variant="ghost" onClick={handleLogout} className="flex items-center space-x-1">
                  <LogOut className="h-4 w-4" />
                  <span>Çıkış</span>
                </Button>
              </div>
            ) : (
              <>

                <Link href="/login">
                  <Button variant="ghost">Giriş</Button>
                </Link>
                <Link href="/signup">
                  <Button variant="ghost">Kayıt Ol</Button>
                </Link>
              </>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300">
              Features
            </Button>
            <Button variant="ghost" className="text-gray-600 dark:text-gray-300">
              About
            </Button>
            <Button>Get Started</Button>
          </div>
        </div>
      </div>
    </nav>
  )
}