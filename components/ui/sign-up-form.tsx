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
import { Mail, Lock, User, Github } from "lucide-react"
import { authAPI, tokenManager } from "@/lib/api"

export default function SignUpForm() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    terms: false,
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.terms) {
      alert("Please accept the Terms of Service and Privacy Policy")
      return
    }

    setIsLoading(true)

    try {
      // Generate username from name (remove spaces, lowercase)
      const username = formData.name.toLowerCase().replace(/\s+/g, '') + Math.floor(Math.random() * 1000)
      
      const response = await authAPI.register({
        email: formData.email,
        password: formData.password,
        username: username,
        displayName: formData.name,
      })

      if (response.success && response.data) {
        // Store token and user ID
        tokenManager.setToken(response.data.token)
        tokenManager.setUserId(response.data.userId)
        
        // Use window.location for more reliable redirect
        window.location.href = "/onboarding"
      } else {
        // Show error message
        alert(response.error?.message || "Registration failed. Please try again.")
        setIsLoading(false)
      }
    } catch (error) {
      console.error("Registration error:", error)
      alert("An error occurred. Please check your connection and try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md rounded-2xl shadow-lg border border-white/10 glass p-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-display font-semibold">Join OpenGuild</h2>
          <p className="text-sm text-text-secondary">Start building with 10,000+ verified builders</p>
        </div>

        {/* Name */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="name" className="text-text-primary">Full Name</Label>
          <div className="flex items-center gap-2 border border-white/10 rounded-lg px-3 h-12 bg-bg-tertiary/50 focus-within:ring-2 focus-within:ring-accent-cyan/50">
            <User className="h-5 w-5 text-text-tertiary" />
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-text-primary placeholder:text-text-tertiary"
            />
          </div>
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
              placeholder="Create a password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              minLength={8}
              className="border-0 shadow-none focus-visible:ring-0 bg-transparent text-text-primary placeholder:text-text-tertiary"
            />
          </div>
        </div>

        {/* Terms */}
        <div className="flex items-start space-x-2">
          <Checkbox 
            id="terms" 
            className="mt-1" 
            checked={formData.terms}
            onCheckedChange={(checked) => setFormData({ ...formData, terms: checked as boolean })}
            required
          />
          <Label htmlFor="terms" className="text-sm font-normal text-text-secondary leading-relaxed">
            I agree to the{" "}
            <Link href="/terms" className="text-accent-cyan hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-accent-cyan hover:underline">
              Privacy Policy
            </Link>
          </Label>
        </div>

        {/* Submit */}
        <Button 
          type="submit"
          disabled={isLoading}
          className="w-full h-12 text-base font-medium rounded-lg bg-gradient-primary hover:shadow-glow-cyan disabled:opacity-50"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
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
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
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

        {/* Login */}
        <p className="text-center text-sm text-text-secondary mt-2">
          Already have an account?{" "}
          <Link href="/login" className="text-accent-cyan cursor-pointer hover:underline font-semibold">
            Sign In
          </Link>
        </p>
      </form>
    </Card>
  )
}
