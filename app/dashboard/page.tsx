'use client';

import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { toast } from "sonner";
import { getSession } from "next-auth/react";

export default function Page() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Handle JWT / NextAuth session and auto-logout
  useEffect(() => {
    if (typeof window === "undefined") return;

    const ensureTokenFromSession = async () => {
      let token = localStorage.getItem("token");

      // If no custom JWT token, but NextAuth session exists (e.g. Google login),
      // create a lightweight client-only JWT so existing logic continues to work.
      if (!token) {
        const session = await getSession();
        if (!session) {
          // No session at all -> logout and redirect
          void fetch("/api/auth/logout", { method: "POST" });
          router.replace("/login");
          return;
        }

        const nowSeconds = Math.floor(Date.now() / 1000);
        const exp = nowSeconds + 60 * 60; // 1 hour from now

        const encode = (obj: unknown) =>
          btoa(JSON.stringify(obj))
            .replace(/=+$/g, "")
            .replace(/\+/g, "-")
            .replace(/\//g, "_");

        const header = { alg: "HS256", typ: "JWT" };
        const payload = { exp };

        token = `${encode(header)}.${encode(payload)}.x`;
        localStorage.setItem("token", token);
      }

      try {
        const payload = JSON.parse(atob(token.split(".")[1] ?? "")) as {
          exp?: number;
        };

        if (!payload?.exp) {
          localStorage.removeItem("token");
          void fetch("/api/auth/logout", { method: "POST" });
          router.replace("/login");
          return;
        }

        const expireAt = payload.exp * 1000;
        const now = Date.now();

        if (expireAt <= now) {
          localStorage.removeItem("token");
          void fetch("/api/auth/logout", { method: "POST" });
          toast.error("Session expired. Please log in again.");
          router.replace("/login");
          return;
        }

        // Schedule automatic logout when token expires
        const timeoutId = window.setTimeout(() => {
          localStorage.removeItem("token");
          void fetch("/api/auth/logout", { method: "POST" });
          toast.error("Session expired. Please log in again.");
          router.replace("/login");
        }, expireAt - now);

        return () => {
          window.clearTimeout(timeoutId);
        };
      } catch {
        localStorage.removeItem("token");
        void fetch("/api/auth/logout", { method: "POST" });
        router.replace("/login");
      }
    };

    void ensureTokenFromSession();
  }, [router]);

  // Handle Google auth success / failure toasts via query params
  useEffect(() => {
    const from = searchParams.get("from");
    const error = searchParams.get("error");

    if (from === "google" && !error) {
      toast.success("Logged in with Google");
    }

    if (error) {
      toast.error("Google authentication failed. Please try again.");
    }
  }, [searchParams]);

  return (
    <div className="flex justify-between items-center p-4">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      <Button
        onClick={() => {
          localStorage.removeItem("token");
          void fetch("/api/auth/logout", { method: "POST" });
          router.replace("/login");
        }}
        className="cursor-pointer"
      >
        Logout
      </Button>
    </div>
  );
}
