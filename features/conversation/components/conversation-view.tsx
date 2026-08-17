"use client";

import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { fetchChatQuota } from "@/features/billing/action/get-chat-quota";
import {
  ChatQuotaMeter,
  ChatUpgradeBanner,
} from "@/features/billing/components/chat-upgrade-banner";
import type { ChatQuota } from "@/features/billing/types";
import { ConversationDownload } from "@/components/ai-elements/conversation";
import { useQueryClient } from "@tanstack/react-query";
import { DefaultChatTransport, isTextUIPart, type UIMessage } from "ai";
import { useChat } from "@ai-sdk/react";
import { SparklesIcon } from "lucide-react";
import React, { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import { useConversations } from "../hooks/use-conversation";
import { queryKeys } from "../utils/query-keys";
import { ChatComposer } from "./chat-composer";
import { ChatEmpty } from "./chat-empty";
import { ChatMessages } from "./chat-messages";

type ConversationViewProps = {
  conversationId: string;
  initialMessages: UIMessage[];
  initialQuota: ChatQuota;
};

const LIMIT_REACHED_MESSAGE =
  "You've used your 3 free messages. Upgrade to continue chatting.";

async function refreshQuota(
  setQuota: React.Dispatch<React.SetStateAction<ChatQuota>>
) {
  try {
    const next = await fetchChatQuota();
    setQuota(next);
  } catch {
    // Server enforcement remains authoritative.
  }
}

function applyOptimisticSend(
  setQuota: React.Dispatch<React.SetStateAction<ChatQuota>>
) {
  setQuota((prev) => {
    if (prev.plan !== "FREE") return prev;

    const used = prev.used + 1;
    const remaining = Math.max(0, prev.limit - used);

    return {
      ...prev,
      used,
      remaining,
      allowed: remaining > 0,
    };
  });
}

function isChatLimitError(error: Error): boolean {
  const message = error.message.toLowerCase();
  return (
    message.includes("chat_limit_reached") ||
    message.includes("3 free messages") ||
    message.includes("upgrade to continue")
  );
}

function handleChatError(
  error: Error,
  setQuota: React.Dispatch<React.SetStateAction<ChatQuota>>
) {
  if (isChatLimitError(error)) {
    setQuota((prev) => ({
      ...prev,
      allowed: false,
      remaining: 0,
      used: prev.plan === "FREE" ? prev.limit : prev.used,
    }));
    toast.error(LIMIT_REACHED_MESSAGE);
    return;
  }

  toast.error(error.message);
  void refreshQuota(setQuota);
}

function lastUserText(messages: UIMessage[]) {
  const lastUser = [...messages]
    .reverse()
    .find((message) => message.role === "user");
  if (!lastUser) return "";
  return lastUser.parts.filter(isTextUIPart).map((part) => part.text).join("").trim();
}

/**
 * Main chat view — header, message list (or empty state), and composer with streaming.
 */
export const ConversationView = ({
  conversationId,
  initialMessages,
  initialQuota,
}: ConversationViewProps) => {
  const queryClient = useQueryClient();
  const { data: conversations } = useConversations();
  const webSearchRef = useRef(false);
  const [quota, setQuota] = useState(initialQuota);

  const isFreePlan = quota.plan === "FREE";
  const isLimitReached = isFreePlan && quota.remaining === 0;

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: "/api/chat",
        prepareSendMessagesRequest: ({ id, messages }) => ({
          body: {
            id,
            message: messages.at(-1),
            webSearchEnabled: webSearchRef.current,
          },
        }),
      }),
    []
  );

  const { messages, sendMessage, status } = useChat({
    id: conversationId,
    messages: initialMessages,
    transport,
    onFinish: () => {
      void queryClient.invalidateQueries({
        queryKey: queryKeys.conversations.all,
      });
      void refreshQuota(setQuota);
    },
    onError: (error) => {
      handleChatError(error, setQuota);
    },
  });

  const title =
    conversations?.find((item) => item.id === conversationId)?.title ?? "Chat";

  function sendText(text: string) {
    if (!text || isLimitReached) return;
    applyOptimisticSend(setQuota);
    void sendMessage({
      parts: [{ type: "text" as const, text }],
    });
  }

  function handleRegenerate() {
    const text = lastUserText(messages);
    if (!text || status !== "ready" || isLimitReached) return;
    sendText(text);
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
        <SidebarTrigger />
        <Separator orientation="vertical" className="mx-1 h-4" />
        <div className="min-w-0 flex-1">
          <h1 className="truncate text-sm font-medium">{title}</h1>
          {isFreePlan ? (
            <p className="truncate text-xs text-muted-foreground">
              Free plan · {quota.used}/{quota.limit} messages
            </p>
          ) : (
            <p className="truncate text-xs text-muted-foreground">Pro plan</p>
          )}
        </div>
        <div className="flex items-center gap-1">
          {isFreePlan ? (
            <Button
              size="sm"
              variant="ghost"
              className="hidden sm:inline-flex"
              render={<Link href="/pricing" />}
              nativeButton={false}
            >
              <SparklesIcon />
              Upgrade
            </Button>
          ) : null}
          {messages.length > 0 ? (
            <ConversationDownload
              messages={messages}
              filename={`${title}.md`}
              className="static top-auto right-auto"
            />
          ) : null}
        </div>
      </header>

      {messages.length === 0 ? (
        <ChatEmpty onPromptSelect={sendText} />
      ) : (
        <ChatMessages
          messages={messages}
          status={status}
          onRegenerate={handleRegenerate}
        />
      )}

      {isLimitReached ? (
        <ChatUpgradeBanner used={quota.used} limit={quota.limit} />
      ) : (
        <>
          {isFreePlan ? (
            <ChatQuotaMeter
              used={quota.used}
              limit={quota.limit}
              remaining={quota.remaining}
            />
          ) : null}
          <ChatComposer
            onSend={({ text, files, webSearchEnabled }) => {
              webSearchRef.current = webSearchEnabled;
              applyOptimisticSend(setQuota);
              void sendMessage({
                parts: [
                  ...files,
                  ...(text ? [{ type: "text" as const, text }] : []),
                ],
              });
            }}
            isSending={status !== "ready"}
            autoFocus
          />
        </>
      )}
    </div>
  );
};
