import { SignUp } from "@clerk/clerk-react"

export function SignUpPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-black px-4">
      <SignUp forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard" />
    </div>
  )
}
