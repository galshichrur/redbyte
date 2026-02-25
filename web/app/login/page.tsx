import { LoginForm } from "@/components/auth/login-form"
import Link from "next/link"
import Image from "next/image"

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-6">
          <Link href="/">
            <Image src="/redbyte-logo.png" alt="RedByte" width={220} className="dark:invert-0" />
          </Link>
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Welcome back</h1>
            <p className="text-sm text-muted-foreground">Sign in to your account to continue</p>
          </div>
        </div>

        <LoginForm />

        <p className="text-center text-sm text-muted-foreground">
          {"Don't have an account? "}
          <Link href="/register" className="text-primary font-medium hover:underline">
            Create one
          </Link>
        </p>
      </div>
    </div>
  )
}
