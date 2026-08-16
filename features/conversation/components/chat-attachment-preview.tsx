"use client";

import { FileIcon, XIcon } from "lucide-react";

import {
  Attachment,
  AttachmentAction,
  AttachmentActions,
  AttachmentContent,
  AttachmentDescription,
  AttachmentGroup,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Spinner } from "@/components/ui/spinner";

export type ComposerAttachment = {
  id: string;
  state: "uploading" | "done" | "error";
  url?: string;
  mediaType: string;
  filename: string;
  previewUrl?: string;
  error?: string;
};

type ChatAttachmentPreviewProps = {
  attachments: ComposerAttachment[];
  onRemove: (id: string) => void;
};

function isImageMediaType(mediaType: string) {
  return mediaType.startsWith("image/");
}

/**
 * Preview strip for attachments queued in the chat composer.
 */
export function ChatAttachmentPreview({
  attachments,
  onRemove,
}: ChatAttachmentPreviewProps) {
  if (attachments.length === 0) return null;

  return (
    <AttachmentGroup className="px-3 pt-3">
      {attachments.map((attachment) => (
        <Attachment
          key={attachment.id}
          state={attachment.state === "uploading" ? "uploading" : attachment.state}
          size="sm"
          orientation={isImageMediaType(attachment.mediaType) ? "vertical" : "horizontal"}
        >
          <AttachmentMedia variant={isImageMediaType(attachment.mediaType) ? "image" : "icon"}>
            {attachment.state === "uploading" ? (
              <Spinner />
            ) : isImageMediaType(attachment.mediaType) && attachment.previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={attachment.previewUrl} alt={attachment.filename} />
            ) : (
              <FileIcon />
            )}
          </AttachmentMedia>
          <AttachmentContent>
            <AttachmentTitle>{attachment.filename}</AttachmentTitle>
            <AttachmentDescription>
              {attachment.state === "error"
                ? (attachment.error ?? "Upload failed")
                : attachment.state === "uploading"
                  ? "Uploading…"
                  : attachment.mediaType}
            </AttachmentDescription>
          </AttachmentContent>
          <AttachmentActions>
            <AttachmentAction
              aria-label={`Remove ${attachment.filename}`}
              onClick={() => onRemove(attachment.id)}
              disabled={attachment.state === "uploading"}
            >
              <XIcon />
            </AttachmentAction>
          </AttachmentActions>
        </Attachment>
      ))}
    </AttachmentGroup>
  );
}
