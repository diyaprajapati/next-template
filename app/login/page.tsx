'use client';

import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { toast } from "sonner"
import { signIn } from "next-auth/react"
import Image from "next/image"

export default function Page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emailError, setEmailError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  // Redirect away from login if already authenticated
  useEffect(() => {
    if (typeof window === "undefined") return;
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
        exp?: number;
      };
      if (payload?.exp && payload.exp * 1000 > Date.now()) {
        router.replace("/dashboard");
      } else {
        localStorage.removeItem("token");
      }
    } catch {
      localStorage.removeItem("token");
    }
  }, [router]);

  const handleLogin = async () => {
    // reset errors
    setEmailError("");
    setPasswordError("");

    // simple client-side validation like zod messages
    let hasError = false;
    if (!email) {
      setEmailError("Email is required");
      hasError = true;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Please enter a valid email");
      toast.error("Please enter a valid email");
      hasError = true;
    }
    if (!password) {
      setPasswordError("Password is required");
      hasError = true;
    }

    if (hasError) return;

    await toast.promise(
      (async () => {
        const res = await fetch("/api/auth/login", {
          method: "POST",
          body: JSON.stringify({ email, password }),
          headers: { "Content-Type": "application/json" },
        });

        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.message || "Login failed");
        }

        // persist token for client-side checks
        if (data?.token) {
          localStorage.setItem("token", data.token);
        }

        return data;
      })(),
      {
        loading: "Logging in...",
        success: () => {
          router.push("/dashboard");
          return "Login successful";
        },
        error: (err: any) => err?.message || "Login failed",
      }
    );
  };

  const handleGoogleLogin = () => {
    // After Google OAuth, go to dashboard with a flag so we can show a toast
    signIn("google", { callbackUrl: "/dashboard?from=google" });
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>Welcome Back</CardTitle>
          <CardDescription>
            Enter your email below to login to your account
          </CardDescription>
          <CardAction>
            <Button className="cursor-pointer" variant="link" onClick={() => router.push('/register')}>
              Sign Up
            </Button>
          </CardAction>
        </CardHeader>

        <CardContent>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label>Email</Label>
              <Input
                type="email"
                placeholder="m@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {emailError && (
                <p className="text-sm text-destructive">{emailError}</p>
              )}
            </div>

            <div className="grid gap-2">
              <Label>Password</Label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              {passwordError && (
                <p className="text-sm text-destructive">{passwordError}</p>
              )}
            </div>
          </div>
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button className="w-full cursor-pointer" onClick={handleLogin}>
            Login
          </Button>

            <div className="relative flex items-center justify-center w-full my-2">
                <div className="grow border-t border-muted-foreground/30"></div>
                <span className="px-3 text-sm text-muted-foreground">or</span>
                <div className="grow border-t border-muted-foreground/30"></div>
            </div>

            <Button
                variant="outline"
                className="w-full cursor-pointer flex items-center justify-center gap-2"
                onClick={handleGoogleLogin}
            >
                <span className="rounded-full p-1">
                <Image src="/google-logo.png" alt="Google" width={20} height={20} />
                </span>
                <span>Login with Google</span>
            </Button>
        </CardFooter>
      </Card>
    </div>
  )
}