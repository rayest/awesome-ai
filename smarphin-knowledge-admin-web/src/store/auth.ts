import { create } from 'zustand'

interface AuthState {
  token: string | null
  displayName: string
  signIn: (token: string, displayName: string) => void
  signOut: () => void
}

export const useAuthStore = create<AuthState>((set) => ({
  token: sessionStorage.getItem('knowledge_admin_token'),
  displayName: sessionStorage.getItem('knowledge_admin_name') || '内容管理员',
  signIn: (token, displayName) => {
    sessionStorage.setItem('knowledge_admin_token', token)
    sessionStorage.setItem('knowledge_admin_name', displayName)
    set({ token, displayName })
  },
  signOut: () => {
    sessionStorage.removeItem('knowledge_admin_token')
    sessionStorage.removeItem('knowledge_admin_name')
    set({ token: null, displayName: '' })
  },
}))
