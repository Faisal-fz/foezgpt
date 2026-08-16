export type UploadedFile = {
  url: string;
  mediaType: string;
  filename: string;
};

/**
 * Uploads a file to `/api/upload` and returns the hosted Blob URL metadata.
 */
export async function uploadFile(file: File): Promise<UploadedFile> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("/api/upload", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as {
      error?: string;
    } | null;
    throw new Error(body?.error ?? "Upload failed");
  }

  return response.json() as Promise<UploadedFile>;
}
