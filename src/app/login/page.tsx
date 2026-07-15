import type { Metadata } from "next";
import { LoginSection } from "@/components/sections/login";

export const metadata: Metadata = {
  title: "Sign in",
  description:
    "Sign in or create a free account for PPC Companion — Amazon PPC Manager training for Filipino Virtual Assistants.",
};

export default function LoginPage() {
  return <LoginSection />;
}
