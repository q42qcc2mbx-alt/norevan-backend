// Admin image upload — writes to public/products/ (local dev) and returns
// the URL the admin form can paste into the images textarea.
//
// For production deployment, swap the fs writes for an object-store upload
// (Vercel Blob, S3, Cloudinary, etc.). For now this keeps the local-dev flow
// simple and matches the existing /public/products asset layout.
import path from "node:path";
import fs from "node:fs/promises";
import crypto from "node:crypto";
import { isAdminAuthed } from "@/lib/auth/admin";

const ALLOWED_MIME = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
]);
const MAX_BYTES = 8 * 1024 * 1024; // 8 MB
const UPLOAD_DIR = path.join(process.cwd(), "public", "products");

export async function POST(req: Request) {
  if (!(await isAdminAuthed())) {
    return Response.json({ error: "unauthorized" }, { status: 401 });
  }

  const form = await req.formData();
  const files = form.getAll("files").filter((f): f is File => f instanceof File);
  if (files.length === 0) {
    return Response.json({ error: "no_files" }, { status: 400 });
  }

  await fs.mkdir(UPLOAD_DIR, { recursive: true });

  const uploaded: { url: string; name: string }[] = [];
  for (const file of files) {
    if (!ALLOWED_MIME.has(file.type)) {
      return Response.json(
        { error: "unsupported_type", type: file.type },
        { status: 400 },
      );
    }
    if (file.size > MAX_BYTES) {
      return Response.json(
        { error: "too_large", name: file.name },
        { status: 413 },
      );
    }

    const ext = path.extname(file.name).toLowerCase() || extFromMime(file.type);
    const safeStem =
      path
        .basename(file.name, path.extname(file.name))
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "")
        .slice(0, 40) || "image";
    const id = crypto.randomBytes(4).toString("hex");
    const finalName = `${safeStem}-${id}${ext}`;
    const filePath = path.join(UPLOAD_DIR, finalName);

    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(filePath, buf);

    uploaded.push({ url: `/products/${finalName}`, name: file.name });
  }

  return Response.json({ uploaded });
}

function extFromMime(mime: string): string {
  switch (mime) {
    case "image/jpeg":
      return ".jpg";
    case "image/png":
      return ".png";
    case "image/webp":
      return ".webp";
    case "image/avif":
      return ".avif";
    default:
      return "";
  }
}
