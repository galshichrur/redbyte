const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL

export interface User {
  id: number
  email: string
  full_name: string
}

export interface AuthResponse {
  access_token: string
  token_type: string
}

export interface EnrollmentCode {
  token: string
  expires_at: string
}

export async function loginUser(email: string, password: string): Promise<AuthResponse> {
  const params = new URLSearchParams({ email, password })
  const res = await fetch(`${API_BASE_URL}/auth/login?${params}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Login failed" }))
    throw new Error(error.detail || "Invalid email or password")
  }

  return res.json()
}

export async function registerUser(email: string, fullName: string, password: string): Promise<AuthResponse> {
  const params = new URLSearchParams({ email, full_name: fullName, password })
  const res = await fetch(`${API_BASE_URL}/auth/register?${params}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Registration failed" }))
    throw new Error(error.detail || "Registration failed")
  }

  return res.json()
}

export async function getCurrentUser(token: string): Promise<User> {
  const res = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    throw new Error("Failed to get user")
  }

  return res.json()
}

export async function createEnrollmentCode(token: string): Promise<EnrollmentCode> {
  const res = await fetch(`${API_BASE_URL}/enrollment/code`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  })

  if (!res.ok) {
    const error = await res.json().catch(() => ({ detail: "Failed to create enrollment code" }))
    throw new Error(error.detail || "Failed to create enrollment code")
  }

  return res.json()
}
