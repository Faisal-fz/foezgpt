import {
  loadChatMessages,
  markMessageStatus,
  saveChatMessages,
  savePendingUserMessage,
} from "@/features/ai/action/chat-store";
import { resolveMessagesForModel } from "@/features/ai/utils/blob-files";
import { getChatModel } from "@/features/ai/utils/model";
import { getWebSearchTools } from "@/features/ai/utils/web-search";
import { requireUser } from "@/features/auth/action/require-user";
import { prisma } from "@/lib/db";
import { auth } from "@clerk/nextjs/server";
import {
  convertToModelMessages,
  createIdGenerator,
  createUIMessageStreamResponse,
  streamText,
  toUIMessageStream,
  type UIMessage,
} from "ai";

/**
 * POST /api/chat — Streams an AI assistant reply for a conversation.
 *
 * Validates auth and ownership, persists the user message, then streams the
 * assistant response via the AI SDK. Final messages are saved when the stream ends.
 */
export async function POST(req: Request) {
  await auth.protect();

  const {
    message,
    id,
    webSearchEnabled,
  }: {
    message: UIMessage;
    id: string;
    webSearchEnabled?: boolean;
  } = await req.json();

  if (!message || !id) {
    return new Response("Missing message or conversation id", { status: 400 });
  }

  const user = await requireUser();

  const conversation = await prisma.conversation.findFirst({
    where: {
      id,
      userId: user.id,
    },
  });

  if (!conversation) {
    return new Response("Conversation not found", { status: 404 });
  }

  const previousMessages = await loadChatMessages(id);

  const alreadySaved = previousMessages.some(
    (storedMessage) => storedMessage.id === message.id
  );

  if (!alreadySaved) {
    const pendingResult = await savePendingUserMessage(user.id, id, message);
    if (!pendingResult.ok) {
      return Response.json(
        {
          code: "CHAT_LIMIT_REACHED",
          message:
            "You've used your 3 free messages. Upgrade to continue chatting.",
          used: pendingResult.used,
          limit: pendingResult.limit,
          upgradeUrl: "/pricing",
        },
        { status: 403 }
      );
    }
  }

  const messages = alreadySaved
    ? previousMessages
    : [...previousMessages, message];

  const modelMessages = await resolveMessagesForModel(messages);

  const result = streamText({
    model: getChatModel(conversation.model),
    system:
      conversation.systemPrompt ?? "You are ChaiGpt , a helpful assistant",
    messages: await convertToModelMessages(modelMessages),
    ...(webSearchEnabled ? { tools: getWebSearchTools() } : {}),
    onError: async () => {
      if (!alreadySaved) {
        await markMessageStatus(message.id, "ERROR");
      }
    },
  });

  result.consumeStream();

  return createUIMessageStreamResponse({
    stream: toUIMessageStream({
      stream: result.stream,
      originalMessages: messages,
      generateMessageId: createIdGenerator({ prefix: "msg", size: 16 }),
      onFinish: async ({ messages: finalMessages, isAborted }) => {
        try {
          if (isAborted && !alreadySaved) {
            await markMessageStatus(message.id, "ERROR");
            return;
          }
          await saveChatMessages(id, finalMessages, { updateTitle: false });
        } catch (error) {
          console.error(error);
          if (!alreadySaved) {
            await markMessageStatus(message.id, "ERROR");
          }
        }
      },
    }),
  });
}
