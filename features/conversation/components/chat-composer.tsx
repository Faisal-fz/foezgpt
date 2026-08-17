"use client";

import * as React from "react";
import {
  ArrowUpIcon,
  GlobeIcon,
  ImageIcon,
  PaperclipIcon,
  UploadIcon,
} from "lucide-react";
import type { FileUIPart } from "ai";
import { toast } from "sonner";

import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { uploadFile } from "@/features/conversation/utils/upload-file";
import {
  ChatAttachmentPreview,
  type ComposerAttachment,
} from "./chat-attachment-preview";

const MAX_ATTACHMENTS = 5;

const FILE_ACCEPT =
  "image/jpeg,image/png,image/gif,image/webp,application/pdf,text/plain,text/markdown,text/csv";

export type ChatSendPayload = {
  text: string;
  files: FileUIPart[];
  webSearchEnabled: boolean;
};

type ChatComposerProps = {
  onSend: (payload: ChatSendPayload) => Promise<void> | void;
  isSending?: boolean;
  placeholder?: string;
  className?: string;
  autoFocus?: boolean;
};

/**
 * Message input form with file/photo attachments, web search toggle, and send button.
 */
export function ChatComposer({
  onSend,
  isSending = false,
  placeholder = "Message ChaiGPT…",
  className,
  autoFocus = false,
}: ChatComposerProps) {
  const [value, setValue] = React.useState("");
  const [webSearchEnabled, setWebSearchEnabled] = React.useState(false);
  const [attachments, setAttachments] = React.useState<ComposerAttachment[]>([]);
  const [isDragging, setIsDragging] = React.useState(false);
  const textareaRef = React.useRef<HTMLTextAreaElement>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const photoInputRef = React.useRef<HTMLInputElement>(null);
  const dragDepthRef = React.useRef(0);

  React.useEffect(() => {
    if (autoFocus) {
      textareaRef.current?.focus();
    }
  }, [autoFocus]);

  const isUploading = attachments.some((item) => item.state === "uploading");
  const readyFiles = attachments.filter((item) => item.state === "done" && item.url);
  const canSend =
    !isSending &&
    !isUploading &&
    (value.trim().length > 0 || readyFiles.length > 0);

  async function handleFilesSelected(files: FileList | File[] | null) {
    if (!files || (files instanceof FileList ? files.length === 0 : files.length === 0)) {
      return;
    }

    const remainingSlots = MAX_ATTACHMENTS - attachments.length;
    if (remainingSlots <= 0) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} attachments per message`);
      return;
    }

    const selected = Array.from(files).slice(0, remainingSlots);

    for (const file of selected) {
      const id = crypto.randomUUID();
      const previewUrl = file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined;

      setAttachments((current) => [
        ...current,
        {
          id,
          state: "uploading",
          mediaType: file.type || "application/octet-stream",
          filename: file.name,
          previewUrl,
        },
      ]);

      try {
        const uploaded = await uploadFile(file);
        setAttachments((current) =>
          current.map((item) =>
            item.id === id
              ? {
                  ...item,
                  state: "done",
                  url: uploaded.url,
                  mediaType: uploaded.mediaType,
                  filename: uploaded.filename,
                }
              : item
          )
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Upload failed";
        toast.error(message);
        setAttachments((current) =>
          current.map((item) =>
            item.id === id
              ? { ...item, state: "error", error: message }
              : item
          )
        );
      }
    }
  }

  function handleRemoveAttachment(id: string) {
    setAttachments((current) => {
      const removed = current.find((item) => item.id === id);
      if (removed?.previewUrl) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return current.filter((item) => item.id !== id);
    });
  }

  function handleDragEnter(event: React.DragEvent) {
    event.preventDefault();
    dragDepthRef.current += 1;
    if (event.dataTransfer.types.includes("Files")) {
      setIsDragging(true);
    }
  }

  function handleDragOver(event: React.DragEvent) {
    event.preventDefault();
  }

  function handleDragLeave(event: React.DragEvent) {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (dragDepthRef.current === 0) {
      setIsDragging(false);
    }
  }

  function handleDrop(event: React.DragEvent) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragging(false);
    void handleFilesSelected(event.dataTransfer.files);
  }

  async function handleSubmit(event?: React.FormEvent) {
    event?.preventDefault();

    const text = value.trim();
    const files: FileUIPart[] = attachments
      .filter((item) => item.state === "done" && item.url)
      .map((item) => ({
        type: "file" as const,
        url: item.url!,
        mediaType: item.mediaType,
        filename: item.filename,
      }));

    if ((!text && files.length === 0) || isSending || isUploading) return;

    setValue("");
    setAttachments((current) => {
      for (const item of current) {
        if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
      }
      return [];
    });

    await onSend({ text, files, webSearchEnabled });
    textareaRef.current?.focus();
  }

  function handleKeyDown(event: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      void handleSubmit();
    }
  }

  return (
    <form
      onSubmit={(event) => void handleSubmit(event)}
      onDragEnter={handleDragEnter}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn("relative mx-auto w-full max-w-3xl px-4 pb-4 md:px-6", className)}
    >
      <InputGroup
        className={cn(
          "relative h-auto min-h-14 flex-col rounded-3xl border-border/80 bg-background shadow-sm transition-all dark:bg-input/40",
          "focus-within:ring-2 focus-within:ring-primary/20 focus-within:shadow-md",
          isDragging && "ring-2 ring-primary/40"
        )}
      >
        {isDragging ? (
          <div className="pointer-events-none absolute inset-0 z-10 flex items-center justify-center rounded-3xl border-2 border-dashed border-primary/50 bg-background/80 backdrop-blur-sm">
            <p className="flex items-center gap-2 text-sm font-medium text-primary">
              <UploadIcon className="size-4" />
              Drop files here
            </p>
          </div>
        ) : null}

        <ChatAttachmentPreview
          attachments={attachments}
          onRemove={handleRemoveAttachment}
        />

        <div className="flex w-full min-w-0 items-end">
          <InputGroupAddon align="inline-start" className="pl-2 pb-2 self-end">
            <TooltipProvider>
              <div className="flex items-center gap-0.5">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={FILE_ACCEPT}
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    void handleFilesSelected(event.target.files);
                    event.target.value = "";
                  }}
                />
                <input
                  ref={photoInputRef}
                  type="file"
                  accept="image/*"
                  capture="environment"
                  multiple
                  className="hidden"
                  onChange={(event) => {
                    void handleFilesSelected(event.target.files);
                    event.target.value = "";
                  }}
                />

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <InputGroupButton
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={isSending || attachments.length >= MAX_ATTACHMENTS}
                        aria-label="Attach file"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <PaperclipIcon />
                      </InputGroupButton>
                    }
                  />
                  <TooltipContent>Attach file</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <InputGroupButton
                        type="button"
                        size="icon-sm"
                        variant="ghost"
                        disabled={isSending || attachments.length >= MAX_ATTACHMENTS}
                        aria-label="Attach photo"
                        onClick={() => photoInputRef.current?.click()}
                      >
                        <ImageIcon />
                      </InputGroupButton>
                    }
                  />
                  <TooltipContent>Attach photo</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger
                    render={
                      <InputGroupButton
                        type="button"
                        size="icon-sm"
                        variant={webSearchEnabled ? "default" : "ghost"}
                        disabled={isSending}
                        aria-label="Search the web"
                        aria-pressed={webSearchEnabled}
                        className={cn(
                          webSearchEnabled && "shadow-[0_0_12px_color-mix(in_oklch,var(--primary)_45%,transparent)]"
                        )}
                        onClick={() => setWebSearchEnabled((current) => !current)}
                      >
                        <GlobeIcon />
                      </InputGroupButton>
                    }
                  />
                  <TooltipContent>Search the web</TooltipContent>
                </Tooltip>
              </div>
            </TooltipProvider>
          </InputGroupAddon>

          <InputGroupTextarea
            ref={textareaRef}
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={isSending}
            rows={1}
            className="max-h-48 min-h-12 flex-1 py-3.5 pl-1 text-[15px] leading-relaxed"
          />

          <InputGroupAddon align="inline-end" className="pr-2 pb-2 self-end">
            <InputGroupButton
              type="submit"
              size="icon-sm"
              variant="default"
              disabled={!canSend}
              className="size-9 rounded-full"
              aria-label="Send message"
            >
              {isSending ? <Spinner /> : <ArrowUpIcon />}
            </InputGroupButton>
          </InputGroupAddon>
        </div>
      </InputGroup>
      <p className="mt-2 text-center text-xs text-muted-foreground">
        {webSearchEnabled
          ? "Web search is on — answers can include live sources."
          : "ChaiGPT can make mistakes. Check important info."}
      </p>
    </form>
  );
}
