"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { clsx } from "clsx";
import { useAppStore, type User } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { FadeUp } from "@/components/shared/scroll-reveal";
import { Envelope as Mail, Lock, Eye, EyeSlash as EyeOff, CircleNotch as Loader2, TrendUp as TrendingUp, Star, ShieldCheck, Warning as WarningCircle } from "@phosphor-icons/react";
import styles from "./auth.module.css";

export function LoginSection() {
  const router = useRouter();
  const login = useAppStore((s) => s.login);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\s*\.[^\s@]+$/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (authMode === "signup" && name.trim().length < 2) {
      setError("Please enter your full name.");
      return;
    }
    setLoading(true);
    try {
      const endpoint = authMode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(authMode === "login" ? { email, password } : { email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Something went wrong");
      const user = data.user as User;
      login(user);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Please try again.");
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
    router.push("/dashboard");
  };

  return (
    <div className={styles.page}>
      <FadeUp className={styles.wrapper}>
        <div className={styles.logo}>
          <div className={styles.logoIcon}>
            <TrendingUp className="h-5 w-5" />
          </div>
          <span className={styles.logoText}>PPC Companion</span>
        </div>

        <div className={styles.header}>
          <h1 className={styles.heading}>
            {authMode === "login" ? "Welcome Back!" : "Start Free"}
          </h1>
          <p className={styles.subhead}>
            {authMode === "login"
              ? "Sign in to continue learning and mastering Amazon PPC."
              : "Create your free account and start mastering Amazon PPC today."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {authMode === "signup" && (
            <label className={styles.field}>
              <span className={styles.label}>Full Name</span>
              <div className={styles.inputWrap}>
                <input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Maria Santos"
                  required
                  className={styles.inputField}
                  style={{ paddingLeft: "12px" }}
                />
              </div>
            </label>
          )}

          <label className={styles.field}>
            <span className={styles.label}>Email Address</span>
            <div className={styles.inputWrap}>
              <Mail className={clsx(styles.inputIcon, "h-5 w-5")} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className={clsx(styles.inputField, styles.inputWide)}
                required
              />
            </div>
          </label>

          <label className={styles.field}>
            <div className="flex items-center justify-between">
              <span className={styles.label}>Password</span>
            </div>
            <div className={styles.inputWrap}>
              <Lock className={clsx(styles.inputIcon, "h-5 w-5")} />
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className={clsx(styles.inputField, styles.inputWide)}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className={styles.passwordToggle}
                aria-label="Toggle password"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </label>

          {authMode === "login" && (
            <button type="button" className={styles.forgotLink}>
              Forgot Password?
            </button>
          )}

          <Button type="submit" disabled={loading} className={clsx(styles.submitBtn, "shadow-md shadow-primary/20")}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : authMode === "login" ? (
              "Login with Email"
            ) : (
              "Create free account"
            )}
          </Button>

          {error && (
            <p role="alert" className={styles.error}>
              <WarningCircle className="h-4 w-4 shrink-0" />
              {error}
            </p>
          )}
        </form>

        <div className={styles.divider}>
          <div className={styles.dividerLine} />
          <span className={styles.dividerText}>Or continue with</span>
          <div className={styles.dividerLine} />
        </div>

        <div className={styles.socialGrid}>
          <button type="button" onClick={handleGuest} className={styles.socialBtn}>
            <svg className="h-5 w-5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            <span className={styles.socialLabel}>Google</span>
          </button>
          <button type="button" onClick={handleGuest} className={styles.socialBtn}>
            <svg className="h-5 w-5 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
            </svg>
            <span className={styles.socialLabel}>Facebook</span>
          </button>
        </div>

        <p className={styles.footerText}>
          {authMode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => setAuthMode((m) => (m === "login" ? "signup" : "login"))}
            className={styles.footerLink}
          >
            {authMode === "login" ? "Create Account" : "Sign in"}
          </button>
        </p>

        <div className={styles.offerBanner}>
          <div className={styles.offerIcon}>
            <Star className="h-6 w-6" />
          </div>
          <div>
            <p className={styles.offerTitle}>Special Offer for New VAs!</p>
            <p className={styles.offerDesc}>
              Sign up today and get the{" "}
              <span className={styles.offerHighlight}>"PPC Basics"</span> module
              completely free.
            </p>
          </div>
        </div>

        <div className={styles.securityBadge}>
          <ShieldCheck className={clsx(styles.securityIcon, "h-4 w-4")} />
          <span className={styles.securityText}>Secure SSL Connection</span>
        </div>
      </FadeUp>
    </div>
  );
}

export default LoginSection;
