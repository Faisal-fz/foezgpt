"use server";

import { isTextUIPart, type UIMessage } from "ai";
import type { Prisma } from "@/lib/generated/prisma/client";
import { FREE_MESSAGE_LIMIT } from "@/features/billing/constants";
import { prisma } from "@/lib/db";

/** Extracts plain text from an AI SDK `UIMessage` by joining all text parts. */
function getMessageText(message: UIMessage) {
  return message.parts.filter(isTextUIPart).map((part) => part.text).join("");
}

/**
 * Normalizes stored message parts from the database into AI SDK `UIMessage` parts.
 * Falls back to a single text part when no structured parts are stored.
 */
function toUIMessageParts(
  parts: Prisma.JsonValue | null,
  content: string
): UIMessage["parts"] {
  const stored = parts as UIMessage["parts"] | null;
  if (Array.isArray(stored) && stored.length > 0) {
    return stored;
  }

  return [{ type: "text", text: content }];
}

/**
 * Loads all messages for a conversation from the database as AI SDK `UIMessage`s.
 *
 * @param conversationId - The conversation whose messages to load.
 * @returns Messages ordered oldest to newest, ready for `useChat`.
 */
export async function loadChatMessages(
  conversationId: string
): Promise<UIMessage[]> {
  const rows = await prisma.message.findMany({
    where: {
      conversationId,
      status: { not: "ERROR" },
    },
    orderBy: { createdAt: "asc" },
  });

  return rows.map((row) => ({
    id: row.id,
    role: row.role === "ASSISTANT" ? "assistant" : "user",
    parts: toUIMessageParts(row.parts, row.content),
  }));
}

type SaveChatMessagesOptions = {
  updateTitle?: boolean;
  status?: "PENDING" | "COMPLETE";
};

export type PendingMessageResult =
  | { ok: true }
  | { ok: false; used: number; limit: number };

/**
 * Atomically checks quota and saves a new user message as PENDING.
 * Only COMPLETE user messages count toward the free tier limit.
 */
export async function savePendingUserMessage(
  userId: string,
  conversationId: string,
  message: UIMessage
): Promise<PendingMessageResult> {
  return prisma.$transaction(async (tx) => {
    const user = await tx.user.findUniqueOrThrow({
      where: { id: userId },
      select: { plan: true },
    });

    if (user.plan !== "PRO") {
      const used = await tx.message.count({
        where: {
          role: "USER",
          status: "COMPLETE",
          conversation: { userId },
        },
      });

      if (used >= FREE_MESSAGE_LIMIT) {
        return { ok: false, used, limit: FREE_MESSAGE_LIMIT };
      }
    }

    const content = getMessageText(message);

    await tx.message.upsert({
      where: { id: message.id },
      create: {
        id: message.id,
        conversationId,
        role: "USER",
        status: "PENDING",
        content,
        parts: message.parts as Prisma.InputJsonValue,
      },
      update: {
        content,
        parts: message.parts as Prisma.InputJsonValue,
        status: "PENDING",
      },
    });

    const conversation = await tx.conversation.findUniqueOrThrow({
      where: { id: conversationId },
      select: { title: true },
    });

    const firstUserText = content.trim();

    await tx.conversation.update({
      where: { id: conversationId },
      data: {
        lastMessageAt: new Date(),
        title:
          conversation.title === "New Chat" && firstUserText
            ? firstUserText.slice(0, 48)
            : conversation.title,
      },
    });

    return { ok: true };
  });
}

export async function markMessageStatus(
  messageId: string,
  status: "COMPLETE" | "ERROR" | "PENDING"
) {
  await prisma.message.updateMany({
    where: { id: messageId },
    data: { status },
  });
}

/**
 * Upserts AI SDK `UIMessage`s into the database for a conversation.
 *
 * @param conversationId - Target conversation ID.
 * @param messages - Messages to persist (system messages are skipped).
 * @param options.updateTitle - When true, auto-titles "New Chat" from the first user message.
 */
export async function saveChatMessages(
  conversationId: string,
  messages: UIMessage[],
  options: SaveChatMessagesOptions = {}
) {
  const { updateTitle = true, status = "COMPLETE" } = options;

  for (const message of messages) {
    if (message.role === "system") continue;

    const content = getMessageText(message);
    const role = message.role === "assistant" ? "ASSISTANT" : "USER";

    await prisma.message.upsert({
      where: { id: message.id },
      create: {
        id: message.id,
        conversationId,
        role,
        status,
        content,
        parts: message.parts as Prisma.InputJsonValue,
      },
      update: {
        content,
        parts: message.parts as Prisma.InputJsonValue,
        status,
      },
    });
  }

  const conversation = await prisma.conversation.findUniqueOrThrow({
    where: { id: conversationId },
    select: { title: true },
  });

  const firstUser = messages.find((message) => message.role === "user");
  const firstUserText = firstUser ? getMessageText(firstUser).trim() : "";

  await prisma.conversation.update({
    where: { id: conversationId },
    data: {
      lastMessageAt: new Date(),
      title:
        updateTitle && conversation.title === "New Chat" && firstUserText
          ? firstUserText.slice(0, 48)
          : conversation.title,
    },
  });
}
