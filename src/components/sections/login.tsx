"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import { useAppStore, type User } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { FadeUp } from "@/components/shared/scroll-reveal";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  TrendingUp,
  Star,
  ShieldCheck,
} from "lucide-react";

const previewAvatars = [
  { initial: "M", label: "Maria S." },
  { initial: "J", label: "Juan D." },
  { initial: "A", label: "Anna R." },
];

export function LoginSection() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const { toast } = useToast();
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint =
        authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          authMode === "login" ? { email, password } : { email, password, name }
        ),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");
      const user = data.user as User;
      login(user);
      toast({
        title: authMode === "login" ? "Welcome back!" : "Account created",
        description: "Taking you to your dashboard…",
      });
      router.push("/dashboard");
    } catch (err) {
      toast({
        title: "Could not sign in",
        description: err instanceof Error ? err.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGuest = () => {
    login({
      id: "guest",
      name: "Guest Student",
      email: "guest@ppc-companion.app",
      role: "student",
    } as User);
    toast({ title: "Exploring as guest", description: "Your progress won't be saved." });
    router.push("/dashboard");
  };

  return (
    <div className="flex h-full min-h-screen w-full overflow-hidden bg-background text-foreground">
      {/* Left column — form */}
      <div className="flex w-full flex-col justify-center overflow-y-auto px-6 py-10 lg:w-1/2 lg:p-12 xl:p-24">
        <FadeUp className="mx-auto w-full max-w-[480px]">
          {/* Logo */}
          <div className="mb-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-white">
              <TrendingUp className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              PPC Companion
            </span>
          </div>

          {/* Header */}
          <div className="mb-6 flex flex-col gap-2">
            <h1 className="text-3xl font-extrabold leading-tight tracking-[-0.033em] md:text-4xl">
              {authMode === "login" ? "Welcome Back!" : "Start Free"}
            </h1>
            <p className="text-base text-muted-foreground">
              {authMode === "login"
                ? "Sign in to continue learning and mastering Amazon PPC."
                : "Create your free account and start mastering Amazon PPC today."}
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {authMode === "signup" && (
              <label className="flex flex-col gap-2">
                <span className="text-sm font-medium text-foreground">Full Name</span>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maria Santos"
                  required
                />
              </label>
            )}

            <label className="flex flex-col gap-2">
              <span className="text-sm font-medium text-foreground">Email Address</span>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="h-12 pl-11"
                  required
                />
              </div>
            </label>

            <label className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">Password</span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="h-12 px-11"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label="Toggle password"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </label>

            {authMode === "login" && (
              <div className="flex justify-end">
                <button
                  type="button"
                  className="text-sm font-medium text-primary hover:underline"
                >
                  Forgot Password?
                </button>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="mt-2 h-12 text-base font-bold shadow-md shadow-primary/20"
            >
              {loading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : authMode === "login" ? (
                "Login with Email"
              ) : (
                "Create free account"
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="relative my-4 flex items-center py-2">
            <div className="h-px flex-grow border-t border-border" />
            <span className="mx-4 flex-shrink-0 text-sm text-muted-foreground">
              Or continue with
            </span>
            <div className="h-px flex-grow border-t border-border" />
          </div>

          {/* Social login buttons */}
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={handleGuest}
              className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card transition-colors hover:bg-muted"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              <span className="text-sm font-semibold text-foreground">Google</span>
            </button>
            <button
              type="button"
              onClick={handleGuest}
              className="flex h-12 items-center justify-center gap-2 rounded-lg border border-border bg-card transition-colors hover:bg-muted"
            >
              <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
              <span className="text-sm font-semibold text-foreground">Facebook</span>
            </button>
          </div>

          {/* Footer link */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            {authMode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
            <button
              type="button"
              onClick={() => setAuthMode((m) => (m === "login" ? "signup" : "login"))}
              className="font-bold text-primary hover:underline"
            >
              {authMode === "login" ? "Create Account" : "Sign in"}
            </button>
          </p>

          {/* Special offer banner */}
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-primary/10 bg-primary/5 p-4">
            <div className="mt-0.5 shrink-0 text-primary">
              <Star className="h-6 w-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-foreground">Special Offer for New VAs!</p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Sign up today and get the{" "}
                <span className="font-semibold text-primary">&quot;PPC Basics&quot;</span> module
                completely free.
              </p>
            </div>
          </div>

          {/* Security badge */}
          <div className="mt-8 flex items-center justify-center gap-1.5 opacity-60">
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Secure SSL Connection</span>
          </div>
        </FadeUp>
      </div>

      {/* Right column — branding with background image */}
      <div className="relative hidden overflow-hidden bg-card lg:flex lg:w-1/2">
        {/* Background image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuCkxGX0GtqgVhtPL1ITKVl30zfUFR2mzu5sMELH6p0GT5V063jwdRchqKxYOAWvbzz3kc-P4oEskKsUkNmz3Cr0P1xWejMhWS5nwTvrfjI4eLHeWXXm4v-vqqnOA6ONxNaQ5uudIkN7uPUI9O2OEQK67hj1WETtEQx4gn9xXNX7eOSZbJbjr0VPu6efZ_0Jh7v7xEFPLEyMO41MK5ROMwqhtRbiPR3d3FAs4zrHfndzwvIlx6rzqw44E6vpG7eICM6sWNsO0fE1jRNC")',
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 z-10 bg-gradient-to-t from-background/90 via-background/50 to-primary/20" />

        {/* Content */}
        <div className="relative z-20 flex max-w-lg flex-col justify-center p-12 text-foreground">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6 }}
            className="mb-8 flex h-16 w-16 items-center justify-center rounded-2xl border border-white/20 bg-white/10 backdrop-blur-md"
          >
            <TrendingUp className="h-8 w-8 text-white" />
          </motion.div>

          <h2 className="mb-4 text-4xl font-bold tracking-tight text-white">
            Master Amazon PPC &amp; Scale Your Career
          </h2>
          <p className="text-lg leading-relaxed font-light text-white/80">
            Join thousands of Filipino Virtual Assistants transforming their skills into
            high-income opportunities. Access world-class training, real-time analytics tools,
            and a supportive community.
          </p>

          {/* Social proof */}
          <div className="mt-10 flex items-center gap-4">
            <div className="flex -space-x-3">
              {previewAvatars.map((a) => (
                <div
                  key={a.label}
                  className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-white/10 text-sm font-bold text-white"
                  aria-label={a.label}
                >
                  {a.initial}
                </div>
              ))}
              <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white/20 bg-primary text-xs font-bold text-white">
                +2k
              </div>
            </div>
            <div className="flex flex-col">
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="h-4 w-4 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm font-medium text-white/70">
                Trusted by VAs worldwide
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginSection;
