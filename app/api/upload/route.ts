import { requireUser } from "@/features/auth/action/require-user";
import { auth } from "@clerk/nextjs/server";
import { put } from "@vercel/blob";
import { randomUUID } from "crypto";

/** Max upload size: 10 MB */
const MAX_FILE_SIZE = 10 * 1024 * 1024;

const ALLOWED_MEDIA_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
  "application/pdf",
  "text/plain",
  "text/markdown",
  "text/csv",
]);

/**
 * POST /api/upload — Uploads a file to Vercel Blob.
 *
 * Requires `BLOB_READ_WRITE_TOKEN` in env (Vercel project → Storage → Blob).
 */
export async function POST(req: Request) {
  await auth.protect();

  const user = await requireUser();

  const formData = await req.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return Response.json({ error: "Missing file" }, { status: 400 });
  }

  if (file.size > MAX_FILE_SIZE) {
    return Response.json({ error: "File exceeds 10 MB limit" }, { status: 400 });
  }

  const mediaType = file.type || "application/octet-stream";
  if (!ALLOWED_MEDIA_TYPES.has(mediaType)) {
    return Response.json({ error: "Unsupported file type" }, { status: 400 });
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const pathname = `uploads/${user.id}/${randomUUID()}-${safeName}`;

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json(
      {
        error:
          "File uploads are not configured. Add BLOB_READ_WRITE_TOKEN to your .env file (Vercel → Storage → Blob).",
      },
      { status: 503 }
    );
  }

  try {
    const blob = await put(pathname, file, {
      access: "public",
      contentType: mediaType,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return Response.json({
      url: blob.url,
      mediaType,
      filename: file.name,
    });
  } catch (error) {
    console.error("Upload failed:", error);
    const message =
      error instanceof Error ? error.message : "Upload failed";
    return Response.json({ error: message }, { status: 500 });
  }
}
