"use server";

import { isAdminAuthed } from "@/lib/auth/admin";
import { api, ApiError } from "@/lib/api/client";

export type PwState = { ok: true } | { ok: false; error: string } | null;

export async function changePasswordAction(
  _prev: PwState,
  form: FormData,
): Promise<PwState> {
  if (!(await isAdminAuthed())) return { ok: false, error: "Nicht angemeldet." };

  const currentPassword = String(form.get("currentPassword") ?? "");
  const newPassword = String(form.get("newPassword") ?? "");
  const confirm = String(form.get("confirm") ?? "");

  if (newPassword.length < 8) {
    return { ok: false, error: "Neues Passwort: mindestens 8 Zeichen." };
  }
  if (newPassword !== confirm) {
    return { ok: false, error: "Die Passwörter stimmen nicht überein." };
  }

  try {
    await api.post("/account/change-password", { currentPassword, newPassword });
    return { ok: true };
  } catch (err) {
    const msg =
      err instanceof ApiError && err.status === 401
        ? "Aktuelles Passwort ist falsch."
        : "Änderung fehlgeschlagen.";
    return { ok: false, error: msg };
  }
}
