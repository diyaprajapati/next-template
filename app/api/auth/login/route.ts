import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";

// POST /api/auth/login
export async function POST(req: Request) {
    try {
        const {email, password} = await req.json();

        if(!email || !password) {
            return NextResponse.json({error: "Email and password are required"}, {status: 400});
        }

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if(!user || !user.password) {
            return NextResponse.json({error: "Invalid credentials"}, {status: 401});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch) {
            return NextResponse.json({error: "Invalid credentials"}, {status: 401});
        }

        const token = jwt.sign(
            { id: user.id, email: user.email },
            process.env.JWT_SECRET as string,
            { expiresIn: "1h" },
        );

        const response = NextResponse.json(
            { message: "Login successful", token },
            { status: 200 }
        );

        response.cookies.set("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
        });

        return response;
    } catch (error: any) {
        console.error("Error logging in:", error);
        return NextResponse.json({error: "Internal server error"}, {status: 500});
    }
}