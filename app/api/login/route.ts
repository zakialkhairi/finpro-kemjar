import { NextRequest, NextResponse } from "next/server";
import { db, User } from "@/lib/db";

export async function POST(request: NextRequest) {
  let executedQuery = "";
  try {
    const body = await request.json();
    const username = body.username !== undefined ? body.username : "";
    const password = body.password !== undefined ? body.password : "";

    // DELIBERATELY VULNERABLE TO SQL INJECTION:
    // Raw string interpolation without parameterized query
    executedQuery = `SELECT * FROM users WHERE username = '${username}' AND password = '${password}'`;

    const user = db.prepare(executedQuery).get() as User | undefined;

    if (!user) {
      return NextResponse.json(
        {
          error: "Invalid username or password",
          executedQuery,
        },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      executedQuery,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
      },
    });

    // Set session cookies
    response.cookies.set("session_user_id", String(user.id), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });

    response.cookies.set("session_role", String(user.role), {
      path: "/",
      httpOnly: false,
      sameSite: "lax",
    });

    return response;
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    // DELIBERATELY VULNERABLE: Return raw SQLite error message and executed query
    return NextResponse.json(
      {
        error: errorMsg,
        executedQuery,
      },
      { status: 500 }
    );
  }
}
