import { NextRequest, NextResponse } from "next/server";
import { db, User } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    // Only check if session_user_id cookie exists
    const sessionCookie = request.cookies.get("session_user_id");
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json(
        { error: "Unauthorized: Sesi tidak ditemukan. Silakan login terlebih dahulu." },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Parameter id wajib disertakan." },
        { status: 400 }
      );
    }

    // DELIBERATELY VULNERABLE TO IDOR (Insecure Direct Object Reference):
    // Fetches the profile using query parameter 'id' directly without verifying
    // if 'id' matches the logged-in session_user_id.
    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
      | User
      | undefined;

    if (!user) {
      return NextResponse.json(
        { error: "Data mahasiswa tidak ditemukan." },
        { status: 404 }
      );
    }

    return NextResponse.json({ user });
  } catch (err: any) {
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
