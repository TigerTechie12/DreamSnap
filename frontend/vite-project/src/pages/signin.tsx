import { SignIn } from "@clerk/clerk-react"

export function SignInPage() {
  return (
    <div className="flex items-center justify-center mt-30">
      <SignIn forceRedirectUrl="/dashboard" fallbackRedirectUrl="/dashboard" />
    </div>
  )
}
