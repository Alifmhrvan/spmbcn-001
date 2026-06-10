import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

export interface UserPayload {
  id: string;
  email: string;
}

export async function verifyUserToken(
  request: NextRequest
): Promise<UserPayload | null> {
  try {
    const authHeader = request.headers.get("authorization");
    const token =
      authHeader?.replace("Bearer ", "") ??
      request.cookies.get("token")?.value; 

    if (!token) return null;

    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll: () => cookieStore.getAll(),
          setAll: () => {},
        },
      }
    );

    const { data: { user }, error } = await supabase.auth.getUser(token);
    if (error || !user) return null;

    return { id: user.id, email: user.email! };
  } catch {
    return null;
  }
}

export async function requireUser(
  request: NextRequest
): Promise<
  | { error: NextResponse; user: null }
  | { error: null; user: UserPayload }
> {
  const user = await verifyUserToken(request);
  if (!user) {
    return {
      error: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
      user: null,
    };
  }
  return { error: null, user };
}
