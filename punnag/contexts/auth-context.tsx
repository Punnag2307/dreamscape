"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import type { User } from "firebase/auth"
import { onAuthStateChange, getUserProfile } from "@/lib/firebase"

type UserProfile = {
  username: string
  email: string
  createdAt: string
}

type AuthContextType = {
  user: User | null
  profile: UserProfile | null
  loading: boolean
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  profile: null,
  loading: true,
})

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  console.log('[AuthProvider] Initializing: loading=', loading);

  useEffect(() => {
    console.log('[AuthProvider] useEffect triggered');
    const unsubscribe = onAuthStateChange(async (authUser) => {
      console.log('[AuthProvider] onAuthStateChange triggered. User:', authUser?.uid);
      setUser(authUser)

      if (authUser) {
        console.log('[AuthProvider] User found, fetching profile...');
        // Fetch user profile
        try {
          const { profile: fetchedProfile, error } = await getUserProfile(authUser.uid)
          if (fetchedProfile && !error) {
            console.log('[AuthProvider] Profile fetched successfully:', fetchedProfile);
            setProfile(fetchedProfile as UserProfile)
          } else {
            console.warn('[AuthProvider] Profile fetch failed or profile empty:', error);
            setProfile(null) // Ensure profile is null if fetch fails
          }
        } catch (profileError) {
            console.error('[AuthProvider] Error fetching profile:', profileError);
            setProfile(null); // Ensure profile is null on error
        }
      } else {
        console.log('[AuthProvider] No user found, setting profile to null.');
        setProfile(null)
      }

      console.log('[AuthProvider] Setting loading to false.');
      setLoading(false)
    })

    return () => {
        console.log('[AuthProvider] Unsubscribing from auth state changes.');
        unsubscribe();
    }
  }, [])

  console.log('[AuthProvider] Rendering with state:', { user: user?.uid, profile, loading });

  return <AuthContext.Provider value={{ user, profile, loading }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)
