"use client";

import SignInForm from "@/components/ui/sign-in-form";
import { RetroGrid } from "@/components/ui/retro-grid";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-bg-primary flex items-center justify-center p-4 sm:p-6 relative overflow-hidden">
      <RetroGrid />
      <div className="w-full max-w-md z-10">
        <SignInForm />
      </div>
    </div>
  );
}
