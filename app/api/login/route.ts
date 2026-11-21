import { NextRequest, NextResponse } from "next/server";
import { db, User } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const username = body.username !== undefined ? body.username : "";
    const password = body.password !== undefined ? body.password : "";

    // DELIBERATELY VULNERABLE TO SQL INJECTION:
    // Raw string interpolation without parameterized query
    const query = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    const user = db.prepare(query).get() as User | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "Invalid username or password" },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    });

    // Set session_user_id cookie
    response.cookies.set("session_user_id", String(user.id), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (err: any) {
    // DELIBERATELY VULNERABLE: Return raw SQLite error message
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
