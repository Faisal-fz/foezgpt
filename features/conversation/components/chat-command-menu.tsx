"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PlusIcon, SparklesIcon } from "lucide-react";

import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { useConversations } from "@/features/conversation/hooks/use-conversation";

export function ChatCommandMenu() {
  const [open, setOpen] = useState(false);
  const router = useRouter();
  const { data: conversations } = useConversations();

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  function go(href: string) {
    setOpen(false);
    router.push(href);
  }

  return (
    <CommandDialog
      open={open}
      onOpenChange={setOpen}
      title="Search chats"
      description="Jump to a conversation or start a new one."
    >
      <CommandInput placeholder="Search chats…" />
      <CommandList>
        <CommandEmpty>No chats found.</CommandEmpty>
        <CommandGroup heading="Actions">
          <CommandItem onSelect={() => go("/")}>
            <PlusIcon />
            New chat
          </CommandItem>
          <CommandItem onSelect={() => go("/pricing")}>
            <SparklesIcon />
            Go to pricing
          </CommandItem>
        </CommandGroup>
        {conversations?.length ? (
          <>
            <CommandSeparator />
            <CommandGroup heading="Chats">
              {conversations.map((conversation) => (
                <CommandItem
                  key={conversation.id}
                  value={`${conversation.title} ${conversation.id}`}
                  onSelect={() => go(`/c/${conversation.id}`)}
                >
                  {conversation.title}
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        ) : null}
      </CommandList>
    </CommandDialog>
  );
}
