import { RegisterForm } from "@/components/auth/register-form"
import Link from "next/link"
import Image from "next/image"

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex flex-col items-center gap-6">
          <Link href="/">
            <Image src="/redbyte-logo.png" alt="RedByte" width={220} className="dark:invert-0" />
          </Link>
          <div className="space-y-1.5 text-center">
            <h1 className="text-2xl font-semibold text-foreground tracking-tight">Create account</h1>
            <p className="text-sm text-muted-foreground">Get started with RedByte</p>
          </div>
        </div>

        <RegisterForm />

        <p className="text-center text-sm text-muted-foreground">
          {"Already have an account? "}
          <Link href="/login" className="text-primary font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
