'use client';

import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();
  return (
    <div className="flex flex-col gap-4 min-h-screen items-center justify-center">
      <div>
        <h1 className="text-4xl font-bold">Welcome</h1>
      </div>
      <div className="flex gap-4">
        <Button className="cursor-pointer" onClick={() => router.push('/login')}>Login</Button>
        <Button className="cursor-pointer" onClick={() => router.push('/register')}>Register</Button>
      </div>
    </div>
  );
}
