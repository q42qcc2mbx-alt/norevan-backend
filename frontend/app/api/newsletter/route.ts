import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email: email.toLowerCase(), subscribed_at: new Date().toISOString() }, { onConflict: "email" });

  if (error) {
    console.error("[newsletter] upsert failed:", error.message);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
