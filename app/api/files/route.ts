import { requireUser } from "@/features/auth/action/require-user";
import { auth } from "@clerk/nextjs/server";
import { get } from "@vercel/blob";

/**
 * GET /api/files?pathname=... — Streams a private blob to the authenticated user.
 */
export async function GET(req: Request) {
  await auth.protect();
  await requireUser();

  const pathname = new URL(req.url).searchParams.get("pathname");

  if (!pathname) {
    return Response.json({ error: "Missing pathname" }, { status: 400 });
  }

  if (!pathname.startsWith("uploads/")) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return Response.json({ error: "Blob storage not configured" }, { status: 503 });
  }

  const result = await get(pathname, {
    access: "private",
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  if (!result || result.statusCode !== 200 || !result.stream) {
    return Response.json({ error: "File not found" }, { status: 404 });
  }

  return new Response(result.stream, {
    headers: {
      "Content-Type": result.blob.contentType ?? "application/octet-stream",
      "Cache-Control": "private, max-age=3600",
    },
  });
}
