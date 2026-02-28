import { useAuth } from "@clerk/clerk-react"
import { Navigate, Outlet } from "react-router-dom"

export function ProtectRoutes() {
  const { isSignedIn, isLoaded } = useAuth()

  if (!isLoaded) return null

  if (!isSignedIn) return <Navigate to="/signin" replace />

  return <Outlet />
}
