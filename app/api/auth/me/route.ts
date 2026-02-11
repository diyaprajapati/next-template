import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export type MeUser = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
};

// GET /api/auth/me – current user from JWT cookie or NextAuth session (e.g. Google)
export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
          id: string;
          email: string;
        };

        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: { id: true, email: true, name: true, image: true },
        });

        if (user) {
          return NextResponse.json({
            user: {
              id: user.id,
              email: user.email,
              name: user.name,
              image: user.image,
            } satisfies MeUser,
          });
        }
      } catch {
        // JWT invalid or expired, fall through to NextAuth session
      }
    }

    const session = await getServerSession(authOptions);
    if (session?.user?.email) {
      const user = await prisma.user.findUnique({
        where: { email: session.user.email },
        select: { id: true, email: true, name: true, image: true },
      });
      if (user) {
        return NextResponse.json({
          user: {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
          } satisfies MeUser,
        });
      }
    }

    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
