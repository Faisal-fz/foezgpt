import {
  BookOpenIcon,
  BugIcon,
  MessageSquareIcon,
  PenLineIcon,
  SparklesIcon,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

const STARTER_PROMPTS = [
  {
    icon: BookOpenIcon,
    title: "Explain a concept",
    prompt: "Explain how transformers work in large language models, in simple terms.",
  },
  {
    icon: PenLineIcon,
    title: "Help me write",
    prompt: "Help me draft a clear, friendly email asking for project feedback.",
  },
  {
    icon: BugIcon,
    title: "Debug my code",
    prompt: "Help me debug a React component that re-renders too often. Ask me for the code if needed.",
  },
  {
    icon: SparklesIcon,
    title: "Summarize a topic",
    prompt: "Give me a concise summary of the latest best practices for Next.js App Router.",
  },
] as const;

type ChatEmptyProps = {
  onPromptSelect?: (text: string) => void;
};

/** Empty-state placeholder shown before the first message is sent. */
export function ChatEmpty({ onPromptSelect }: ChatEmptyProps) {
  return (
    <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
      >
        <div className="absolute top-1/4 left-1/2 size-72 -translate-x-1/2 rounded-full bg-primary/15 blur-3xl dark:bg-primary/25" />
        <div className="absolute right-1/4 bottom-1/3 size-56 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <Empty className="border-0">
        <EmptyHeader>
          <EmptyMedia variant="icon">
            <MessageSquareIcon />
          </EmptyMedia>
          <EmptyTitle className="text-2xl tracking-tight">
            How can I help you today?
          </EmptyTitle>
          <EmptyDescription>
            Ask anything — replies stream in real time.
          </EmptyDescription>
        </EmptyHeader>

        {onPromptSelect ? (
          <div className="mt-6 grid w-full max-w-xl grid-cols-1 gap-2 sm:grid-cols-2">
            {STARTER_PROMPTS.map((item) => (
              <Button
                key={item.title}
                type="button"
                variant="outline"
                className="h-auto justify-start gap-3 rounded-2xl px-4 py-3 text-left whitespace-normal transition-all hover:border-primary/40 hover:bg-primary/5"
                onClick={() => onPromptSelect(item.prompt)}
              >
                <item.icon className="size-4 shrink-0 text-primary" />
                <span className="text-sm font-medium">{item.title}</span>
              </Button>
            ))}
          </div>
        ) : null}
      </Empty>
    </div>
  );
}
