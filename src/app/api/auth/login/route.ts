import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import { timingSafeEqual } from "crypto";

function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a, "utf8");
    const bufB = Buffer.from(b, "utf8");
    if (bufA.length !== bufB.length) {
      // Still do the comparison to prevent timing attacks, but return false
      timingSafeEqual(
        Buffer.alloc(bufB.length),
        Buffer.alloc(bufB.length)
      );
      return false;
    }
    return timingSafeEqual(bufA, bufB);
  } catch {
    return false;
  }
}

export async function POST(req: NextRequest) {
  const { username, password } = await req.json();

  const validUsername = process.env.AUTH_USERNAME || "admin";
  const validPassword = process.env.AUTH_PASSWORD || "arc2024";

  const usernameMatch = safeCompare(username || "", validUsername);
  const passwordMatch = safeCompare(password || "", validPassword);

  if (!usernameMatch || !passwordMatch) {
    return NextResponse.json(
      { error: "Invalid username or password" },
      { status: 401 }
    );
  }

  const secret = new TextEncoder().encode(
    process.env.JWT_SECRET || "arc-fallback-secret-change-in-production"
  );

  const token = await new SignJWT({ username, role: "admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("8h")
    .sign(secret);

  const response = NextResponse.json({ success: true });
  response.cookies.set("arc_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 60 * 60 * 8, // 8 hours
    path: "/",
  });

  return response;
}
