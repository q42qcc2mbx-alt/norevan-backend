import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  const { email } = await req.json();

  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // The subscribers table is locked to the public API (RLS, no policy), so this
  // privileged write needs the service-role key. Never fall back to the anon key.
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    console.error("[newsletter] SUPABASE_SERVICE_ROLE_KEY missing — signup disabled");
    return NextResponse.json({ error: "Newsletter temporarily unavailable" }, { status: 503 });
  }

  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, serviceKey);

  const { error } = await supabase
    .from("newsletter_subscribers")
    .upsert({ email: email.toLowerCase(), subscribed_at: new Date().toISOString() }, { onConflict: "email" });

  if (error) {
    console.error("[newsletter] upsert failed:", error.message);
    return NextResponse.json({ error: "Failed to subscribe" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
