import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    success: true,
    message: "Logout berhasil.",
  });

  response.cookies.set("session_user_id", "", {
    path: "/",
    expires: new Date(0),
  });

  return response;
}
