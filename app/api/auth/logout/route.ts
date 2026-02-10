import { NextResponse } from "next/server";

// POST /api/auth/logout
export async function POST(req: Request) {
    const response = NextResponse.json({message: "Logout successful"}, {status: 200});

    response.cookies.set("token", "", {
        httpOnly: true,
        expires: new Date(0),
        path: "/",
    })

    return response;
}