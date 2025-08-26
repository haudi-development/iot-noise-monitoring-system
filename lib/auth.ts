export interface User {
  id: string
  username: string
  email: string
  role: 'admin' | 'operator'
  companyId?: string
}

const CREDENTIALS = {
  admin: { username: 'admin', password: 'admin123', role: 'admin' as const },
  operator: { username: 'operator', password: 'operator123', role: 'operator' as const }
}

export async function authenticate(username: string, password: string): Promise<User | null> {
  const credential = Object.values(CREDENTIALS).find(
    cred => cred.username === username && cred.password === password
  )

  if (!credential) {
    return null
  }

  const user: User = {
    id: credential.username,
    username: credential.username,
    email: `${credential.username}@alsok.co.jp`,
    role: credential.role,
  }

  if (typeof window !== 'undefined') {
    localStorage.setItem('user', JSON.stringify(user))
  }

  return user
}

export function getUser(): User | null {
  if (typeof window === 'undefined') return null
  
  const userStr = localStorage.getItem('user')
  if (!userStr) return null
  
  try {
    return JSON.parse(userStr) as User
  } catch {
    return null
  }
}

export function logout() {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
  }
}

export function isAuthenticated(): boolean {
  return getUser() !== null
}