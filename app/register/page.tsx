"use client"


import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState } from "react"
import img from "../../public/google_logo.png"

export default function RegisterPage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleGoogleSignup = async () => {
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Simulate getting user email from Google OAuth
    const userEmail = "user@gmail.com" // This would come from Google OAuth in real implementation

    // Redirect to complete registration page with email
    router.push(`/register/complete?email=${encodeURIComponent(userEmail)}`)
  }

  return (
    <div className="container mx-auto px-4 py-16 max-w-md">
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Create an account</CardTitle>
          <CardDescription>Join the StackIt community</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={handleGoogleSignup}
              className="w-full"
              disabled={isLoading}
              variant="outline"
            >
              <img src={img.src} alt="Google" className="h-8 w-8" />
              {isLoading ? "Creating account..." : "Sign up with Google"}
            </Button>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
