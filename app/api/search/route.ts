import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") ?? "";

    // DELIBERATELY VULNERABLE TO UNION SELECT SQL INJECTION:
    // Raw string interpolation inside LIKE clause with exactly 3 columns (full_name, nim, role)
    const query = `SELECT full_name, nim, role FROM users WHERE full_name LIKE '%${q}%'`;

    const results = db.prepare(query).all();

    return NextResponse.json({
      query: q,
      results,
    });
  } catch (err: any) {
    // Return raw SQLite error message for error-based SQLi / syntax feedback
    return NextResponse.json(
      { error: err?.message || String(err) },
      { status: 500 }
    );
  }
}
