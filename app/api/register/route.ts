import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { full_name, nim, username, password, secret_note } = body;

    if (!username || !password || !full_name || !nim) {
      return NextResponse.json(
        { error: "Nama lengkap, NIM, username, dan password wajib diisi." },
        { status: 400 }
      );
    }

    const insertStmt = db.prepare(`
      INSERT INTO users (username, password, full_name, nim, gpa, role, secret_note)
      VALUES (?, ?, ?, ?, '3.50', 'mahasiswa', ?)
    `);

    const result = insertStmt.run(
      username,
      password,
      full_name,
      nim,
      secret_note || ""
    );

    return NextResponse.json({
      success: true,
      message: "Akun berhasil didaftarkan.",
      userId: result.lastInsertRowid,
    });
  } catch (err: any) {
    if (err?.message?.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: "Username sudah digunakan. Silakan gunakan username lain." },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
