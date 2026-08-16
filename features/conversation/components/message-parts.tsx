"use client";

import {
  isFileUIPart,
  isTextUIPart,
  type FileUIPart,
  type SourceUrlUIPart,
  type UIMessage,
} from "ai";
import { ExternalLinkIcon, FileIcon } from "lucide-react";

import { MessageResponse } from "@/components/ai-elements/message";
import {
  Attachment,
  AttachmentContent,
  AttachmentDescription,
  AttachmentMedia,
  AttachmentTitle,
} from "@/components/ui/attachment";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

function isImageMediaType(mediaType: string) {
  return mediaType.startsWith("image/");
}

function isSourceUrlPart(part: UIMessage["parts"][number]): part is SourceUrlUIPart {
  return part.type === "source-url";
}

function isWebSearchToolPart(part: UIMessage["parts"][number]) {
  return (
    part.type.startsWith("tool-") &&
    "toolCallId" in part &&
    (part.type === "tool-web_search" ||
      part.type.includes("web_search") ||
      part.type.includes("web-search"))
  );
}

function FilePart({ part }: { part: FileUIPart }) {
  if (isImageMediaType(part.mediaType)) {
    return (
      <Attachment size="sm" orientation="vertical" className="max-w-48">
        <AttachmentMedia variant="image">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={part.url} alt={part.filename ?? "Image"} />
        </AttachmentMedia>
        {part.filename ? (
          <AttachmentContent>
            <AttachmentTitle>{part.filename}</AttachmentTitle>
          </AttachmentContent>
        ) : null}
      </Attachment>
    );
  }

  return (
    <Attachment size="sm" className="min-w-48">
      <AttachmentMedia>
        <FileIcon />
      </AttachmentMedia>
      <AttachmentContent>
        <AttachmentTitle>{part.filename ?? "File"}</AttachmentTitle>
        <AttachmentDescription>{part.mediaType}</AttachmentDescription>
      </AttachmentContent>
      <a
        href={part.url}
        target="_blank"
        rel="noopener noreferrer"
        className="absolute inset-0 z-10"
        aria-label={`Open ${part.filename ?? "file"}`}
      />
    </Attachment>
  );
}

type MessagePartsProps = {
  message: UIMessage;
  className?: string;
};

/**
 * Renders all parts of a UIMessage — text, files, web search sources, and tool states.
 */
export function MessageParts({ message, className }: MessagePartsProps) {
  const sourceParts = message.parts.filter(isSourceUrlPart);

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {message.parts.map((part, index) => {
        if (isTextUIPart(part)) {
          if (!part.text) return null;
          return (
            <MessageResponse key={`text-${index}`}>{part.text}</MessageResponse>
          );
        }

        if (isFileUIPart(part)) {
          return <FilePart key={`file-${index}`} part={part} />;
        }

        if (isWebSearchToolPart(part)) {
          const state = "state" in part ? part.state : undefined;
          if (state === "input-streaming" || state === "input-available") {
            return (
              <p
                key={`tool-${index}`}
                className="text-xs text-muted-foreground italic"
              >
                Searching the web…
              </p>
            );
          }
          return null;
        }

        return null;
      })}

      {sourceParts.length > 0 ? (
        <div className="flex flex-wrap gap-1.5 pt-1">
          {sourceParts.map((source) => (
            <Badge key={source.sourceId} variant="secondary" className="gap-1">
              <a
                href={source.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex max-w-48 items-center gap-1 truncate"
              >
                <ExternalLinkIcon className="size-3 shrink-0" />
                <span className="truncate">
                  {source.title ?? new URL(source.url).hostname}
                </span>
              </a>
            </Badge>
          ))}
        </div>
      ) : null}
    </div>
  );
}
