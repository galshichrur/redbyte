"use client"

import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { getCurrentUser, type User } from "./api"

interface AuthContextType {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (token: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const savedToken = localStorage.getItem("redbyte_token")
    if (savedToken) {
      getCurrentUser(savedToken)
        .then((userData) => {
          if (userData && userData.full_name) {
            setUser(userData)
            setToken(savedToken)
          } else {
            console.log("[v0] Invalid user data received:", userData)
            localStorage.removeItem("redbyte_token")
          }
        })
        .catch((err) => {
          console.log("[v0] Failed to get user on mount:", err)
          localStorage.removeItem("redbyte_token")
        })
        .finally(() => setIsLoading(false))
    } else {
      setIsLoading(false)
    }
  }, [])

  const login = async (newToken: string) => {
    try {
      localStorage.setItem("redbyte_token", newToken)
      setToken(newToken)
      const userData = await getCurrentUser(newToken)
      if (userData && userData.full_name) {
        setUser(userData)
      } else {
        console.log("[v0] Invalid user data after login:", userData)
        throw new Error("Invalid user data received")
      }
    } catch (err) {
      console.log("[v0] Login error:", err)
      localStorage.removeItem("redbyte_token")
      setToken(null)
      setUser(null)
      throw err
    }
  }

  const logout = () => {
    localStorage.removeItem("redbyte_token")
    setToken(null)
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider")
  }
  return context
}
