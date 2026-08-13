import { create } from "zustand"
import { persist } from "zustand/middleware"
import Cookies from "js-cookie"

export interface AuthUser {
  id: string
  name: string
  email: string
  role: string
  avatar?: string | null
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  isHydrated: boolean
  pendingEmail: string | null // set after step 1 (login), used on the OTP screen

  startOtp: (email: string) => void
  login: (user: AuthUser, token: string) => void
  updateUser: (patch: Partial<AuthUser>) => void
  logout: () => void
}

const COOKIE = "accessToken"

// Everything a component needs (isAuthenticated, user, pendingEmail) lives as a
// flat, always-defined field on this store — never nested under a value that
// can itself be null. That's what was crashing the app before: components were
// destructuring `store.user.email` / `store.user.isAuthenticated` and `user`
// starts out as `null`, so the destructure blew up on first render.
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      isHydrated: false,
      pendingEmail: null,

      startOtp: (email) => set({ pendingEmail: email }),

      login: (user, token) => {
        Cookies.set(COOKIE, token, {
          expires: 7,
          secure: import.meta.env.PROD,
          sameSite: "Strict",
        })
        set({ user, isAuthenticated: true, pendingEmail: null })
      },

      updateUser: (patch) =>
        set((state) => ({ user: state.user ? { ...state.user, ...patch } : state.user })),

      logout: () => {
        Cookies.remove(COOKIE)
        set({ user: null, isAuthenticated: false, pendingEmail: null })
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
      onRehydrateStorage: () => (state) => {
        if (state) state.isHydrated = true
      },
    }
  )
)
