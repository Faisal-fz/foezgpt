"use client";

import type { ChatStatus, UIMessage } from "ai";
import { isTextUIPart } from "ai";
import { CopyIcon, RefreshCwIcon } from "lucide-react";
import { toast } from "sonner";

import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageAction,
  MessageActions,
  MessageContent,
} from "@/components/ai-elements/message";
import { Loader } from "@/components/ai-elements/loader";
import { MessageParts } from "./message-parts";

type ChatMessagesProps = {
  messages: UIMessage[];
  status: ChatStatus;
  onRegenerate?: () => void;
};

function getMessageText(message: UIMessage) {
  return message.parts.filter(isTextUIPart).map((part) => part.text).join("");
}

async function copyMessage(message: UIMessage) {
  const text = getMessageText(message).trim();
  if (!text) {
    toast.error("Nothing to copy");
    return;
  }

  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  } catch {
    toast.error("Couldn't copy message");
  }
}

/**
 * Renders the conversation message list with markdown responses and a loading indicator.
 */
export function ChatMessages({
  messages,
  status,
  onRegenerate,
}: ChatMessagesProps) {
  const isWaiting =
    status === "submitted" && messages.at(-1)?.role === "user";
  const lastAssistantId = [...messages]
    .reverse()
    .find((message) => message.role === "assistant")?.id;

  return (
    <Conversation>
      <ConversationContent className="py-8">
        {messages.map((message) => {
          const isLastAssistant =
            message.role === "assistant" && message.id === lastAssistantId;
          const isStreamingThis =
            isLastAssistant && status === "streaming";

          return (
            <Message
              key={message.id}
              from={message.role}
              className="animate-in fade-in slide-in-from-bottom-2 duration-300"
            >
              <MessageContent>
                <MessageParts
                  message={message}
                  isAnimating={isStreamingThis}
                />
              </MessageContent>
              <MessageActions className="opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                <MessageAction
                  tooltip="Copy"
                  onClick={() => void copyMessage(message)}
                >
                  <CopyIcon />
                </MessageAction>
                {isLastAssistant && onRegenerate ? (
                  <MessageAction
                    tooltip="Regenerate"
                    disabled={status !== "ready"}
                    onClick={onRegenerate}
                  >
                    <RefreshCwIcon />
                  </MessageAction>
                ) : null}
              </MessageActions>
            </Message>
          );
        })}

        {isWaiting ? (
          <Message
            from="assistant"
            className="animate-in fade-in slide-in-from-bottom-2 duration-300"
          >
            <MessageContent>
              <Loader />
            </MessageContent>
          </Message>
        ) : null}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  );
}
