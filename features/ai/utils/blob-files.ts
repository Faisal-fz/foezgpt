import { issueSignedToken, presignUrl } from "@vercel/blob";
import { isFileUIPart, type UIMessage } from "ai";

const PRESIGNED_URL_TTL_MS = 60 * 60 * 1000;

/** Builds an app-relative URL for authenticated blob file access. */
export function toBlobFileUrl(pathname: string) {
  return `/api/files?pathname=${encodeURIComponent(pathname)}`;
}

/** Extracts a blob pathname from a proxy URL or Vercel Blob URL. */
export function extractBlobPathname(url: string): string | null {
  if (url.startsWith("/api/files")) {
    return new URL(url, "http://localhost").searchParams.get("pathname");
  }

  if (url.includes(".blob.vercel-storage.com")) {
    try {
      const pathname = new URL(url).pathname;
      return pathname.startsWith("/") ? pathname.slice(1) : pathname;
    } catch {
      return null;
    }
  }

  return null;
}

async function getPresignedBlobUrl(pathname: string) {
  const validUntil = Date.now() + PRESIGNED_URL_TTL_MS;

  const signedToken = await issueSignedToken({
    pathname,
    operations: ["get"],
    validUntil,
    token: process.env.BLOB_READ_WRITE_TOKEN,
  });

  const { presignedUrl } = await presignUrl(signedToken, {
    pathname,
    operation: "get",
    access: "private",
    validUntil,
  });

  return presignedUrl;
}

/**
 * Replaces private blob proxy URLs with time-limited presigned URLs
 * so external model providers can fetch attachments.
 */
export async function resolveMessagesForModel(
  messages: UIMessage[]
): Promise<UIMessage[]> {
  return Promise.all(
    messages.map(async (message) => {
      const parts = await Promise.all(
        message.parts.map(async (part) => {
          if (!isFileUIPart(part)) return part;

          const pathname = extractBlobPathname(part.url);
          if (!pathname) return part;

          try {
            const presignedUrl = await getPresignedBlobUrl(pathname);
            return { ...part, url: presignedUrl };
          } catch (error) {
            console.error("Failed to presign blob URL:", error);
            return part;
          }
        })
      );

      return { ...message, parts };
    })
  );
}
