"use client"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/Button"
import { Input } from "@/components/ui/Input"
import { Label } from "@/components/ui/Label"
import { Checkbox } from "@/components/ui/Checkbox"
import { Card } from "@/components/ui/Card"
import { Mail, Lock, Github } from "lucide-react"
import { authAPI, tokenManager } from "@/lib/api"

export default function SignInForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    remember: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    console.log("🔐 Starting login process...")
    console.log("Email:", formData.email)

    try {
      console.log("📡 Calling API:", `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/auth/login`)
      
      const response = await authAPI.login({
        email: formData.email,
        password: formData.password,
      })

      console.log("📥 API Response:", response)

      if (response.success && response.data) {
        console.log("✅ Login successful!")
        console.log("Token:", response.data.token)
        console.log("User ID:", response.data.userId)
        
        // Store token and user ID
        tokenManager.setToken(response.data.token)
        tokenManager.setUserId(response.data.userId)
        
        console.log("💾 Token stored in localStorage")
        console.log("Verifying storage:", {
          token: localStorage.getItem('auth_token'),
          userId: localStorage.getItem('user_id')
        })
        
        // Add small delay to ensure localStorage is saved, then redirect
        setTimeout(() => {
          console.log("🔄 Redirecting to dashboard NOW...")
          window.location.href = "/dashboard"
        }, 100)
      } else {
        console.error("❌ Login failed:", response.error)
        // Show error message
        alert(response.error?.message || "Login failed. Please try again.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("💥 Login error:", error)
      alert("An error occurred. Please check your connection and try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md rounded-2xl shadow-lg border border-white/10 glass p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-semibold">Welcome Back</h2>
          <p className="text-sm text-text-secondary">Sign in to continue to OpenGuild</p>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="email" className="text-text-primary">Email</Label>
          <div className="flex items-center gap-2 border border-white/10 rounded-lg px-3 h-12 bg-bg-tertiary/50 focus-within:ring-2 focus-within:ring-accent-cyan/50">
            <Mail className="h-5 w-5 text-text-tertiary" />
            <Input
              id="email"
              type="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              required
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-text-primary placeholder:text-text-tertiary"
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="password" className="text-text-primary">Password</Label>
          <div className="flex items-center gap-2 border border-white/10 rounded-lg px-3 h-12 bg-bg-tertiary/50 focus-within:ring-2 focus-within:ring-accent-cyan/50">
            <Lock className="h-5 w-5 text-text-tertiary" />
            <Input
              id="password"
              type="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-text-primary placeholder:text-text-tertiary"
            />
          </div>
        </div>

        {/* Remember me & Forgot */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="remember" 
              checked={formData.remember}
              onCheckedChange={(checked) => setFormData({ ...formData, remember: checked as boolean })}
            />
            <Label htmlFor="remember" className="text-sm font-normal text-text-secondary">
              Remember me
            </Label>
          </div>
          <Link href="/forgot-password" className="text-sm text-accent-cyan hover:underline">
            Forgot password?
          </Link>
        </div>

        {/* Submit */}
        <Button 
          type="submit" 
          disabled={isLoading}
          className="w-full h-12 text-base font-medium rounded-lg bg-gradient-primary hover:shadow-glow-cyan disabled:opacity-50"
        >
          {isLoading ? "Signing in..." : "Sign In"}
        </Button>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-bg-tertiary px-2 text-text-tertiary">Or continue with</span>
          </div>
        </div>

        {/* Social login buttons */}
        <div className="flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-lg flex items-center justify-center gap-3 border-white/10 hover:bg-white/5"
          >
            <Image
              src="https://www.svgrepo.com/show/355037/google.svg"
              alt="Google"
              width={20}
              height={20}
            />
            Continue with Google
          </Button>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 rounded-lg flex items-center justify-center gap-3 border-white/10 hover:bg-white/5"
          >
            <Github className="w-5 h-5" />
            Continue with GitHub
          </Button>
        </div>

        {/* Signup */}
        <p className="text-center text-sm text-text-secondary mt-2">
          Don't have an account?{" "}
          <Link href="/signup" className="text-accent-cyan cursor-pointer hover:underline font-semibold">
            Sign Up
          </Link>
        </p>
      </form>
    </Card>
  )
}
