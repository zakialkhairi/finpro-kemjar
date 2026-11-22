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

    const defaultSemesterGpas = JSON.stringify({
      sem1: "3.80",
      sem2: "3.84",
      sem3: "3.86",
      sem4: "3.90",
    });

    const insertStmt = db.prepare(`
      INSERT INTO users (username, password, full_name, nim, gpa, semester_gpas, role, secret_note)
      VALUES (?, ?, ?, ?, '3.85', ?, 'mahasiswa', ?)
    `);

    const result = insertStmt.run(
      username,
      password,
      full_name,
      nim,
      defaultSemesterGpas,
      secret_note || "Tidak ada catatan rahasia."
    );

    return NextResponse.json({
      success: true,
      message: "Akun berhasil didaftarkan.",
      userId: result.lastInsertRowid,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    if (errorMsg.includes("UNIQUE constraint failed")) {
      return NextResponse.json(
        { error: "Username sudah digunakan. Silakan gunakan username lain." },
        { status: 400 }
      );
    }
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
