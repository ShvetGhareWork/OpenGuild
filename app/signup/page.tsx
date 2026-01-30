"use client";

import SignUpForm from "@/components/ui/sign-up-form";
import { RetroGrid } from "@/components/ui/retro-grid";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <RetroGrid />
      <div className="w-full max-w-md z-10">
        <SignUpForm />
      </div>
    </div>
  );
}
