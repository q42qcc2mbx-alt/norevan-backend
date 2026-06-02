import { api } from "@/lib/api/client";
import { getSupabaseAccessToken } from "@/lib/supabase/server";

// Forwards a review submission to the backend with the current Supabase token.
export async function POST(request: Request) {
  try {
    const token = await getSupabaseAccessToken();
    if (!token) {
      return Response.json(
        { status: "error", message: "Bitte zuerst anmelden." },
        { status: 401 },
      );
    }
    const body = (await request.json()) as {
      slug?: string;
      rating?: number;
      body?: string;
    };
    const data = await api.post("/reviews", body, { token });
    return Response.json({ status: "success", data });
  } catch (err) {
    const status =
      typeof err === "object" && err && "status" in err
        ? Number((err as { status?: number }).status) || 500
        : 500;
    return Response.json(
      { status: "error", message: "Bewertung konnte nicht gespeichert werden." },
      { status },
    );
  }
}
