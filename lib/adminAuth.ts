import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;

export interface AdminPayload {
  id: string;
  email: string;
  role: "admin" | "superadmin";
}

export function verifyAdminToken(request: NextRequest): AdminPayload | null {
  try {
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.replace("Bearer ", "") ??
      request.cookies.get("token")?.value; 

    if (!token) return null;

    const payload = jwt.verify(token, JWT_SECRET) as AdminPayload;
    if (!["admin", "superadmin"].includes(payload.role)) return null;

    return payload;
  } catch {
    return null;
  }
}

export function requireAdmin(
  request: NextRequest
): { error: NextResponse; admin: null } | { error: null; admin: AdminPayload } {
  const admin = verifyAdminToken(request);
  if (!admin) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      admin: null,
    };
  }
  return { error: null, admin };
}
