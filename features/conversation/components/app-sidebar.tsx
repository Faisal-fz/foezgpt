"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  MessageSquarePlusIcon,
  MoreHorizontalIcon,
  PencilIcon,
  PinIcon,
  PinOffIcon,
  PlusIcon,
  SparklesIcon,
  Trash2Icon,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ModeToggle } from "@/components/ui/mode-toggle";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { SidebarUpgradeNudge } from "@/features/billing/components/sidebar-upgrade-nudge";
import {
  useConversations,
  useDeleteConversation,
  useUpdateConversation,
} from "@/features/conversation/hooks/use-conversation";
import { cn } from "@/lib/utils";

type Conversation = NonNullable<
  ReturnType<typeof useConversations>["data"]
>[number];

/**
 * Main application sidebar — logo, new chat, conversation list, theme toggle, and account.
 */
export function AppSidebar() {
  const pathname = usePathname();
  const { data: conversations, isLoading } = useConversations();

  const activeId = pathname.startsWith("/c/")
    ? pathname.split("/")[2]
    : undefined;

  return (
    <Sidebar collapsible="icon" variant="inset">
      <SidebarHeader className="gap-2">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="font-semibold tracking-tight"
              render={<Link href="/" />}
            >
              <span className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-primary/70 text-sm font-bold text-primary-foreground shadow-sm">
                茶
              </span>
              <span>ChaiGPT</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="New chat" render={<Link href="/" />}>
              <PlusIcon />
              <span>New chat</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Chats</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <ChatList
                conversations={conversations}
                isLoading={isLoading}
                activeId={activeId}
              />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarFooterMenu />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}

/** Renders the conversation list with loading skeletons or an empty-state message. */
function ChatList({
  conversations,
  isLoading,
  activeId,
}: {
  conversations: Conversation[] | undefined;
  isLoading: boolean;
  activeId: string | undefined;
}) {
  if (isLoading) {
    return (
      <>
        {Array.from({ length: 5 }).map((_, index) => (
          <SidebarMenuItem key={index}>
            <Skeleton className="h-8 w-full" />
          </SidebarMenuItem>
        ))}
      </>
    );
  }

  if (!conversations?.length) {
    return (
      <div className="flex flex-col items-start gap-2 px-2 py-3 group-data-[collapsible=icon]:hidden">
        <p className="text-xs text-muted-foreground">No chats yet</p>
        <Button
          size="sm"
          variant="outline"
          className="gap-1.5"
          render={<Link href="/" />}
          nativeButton={false}
        >
          <MessageSquarePlusIcon />
          Start your first chat
        </Button>
      </div>
    );
  }

  return (
    <>
      {conversations.map((conversation) => (
        <ChatItem
          key={conversation.id}
          conversation={conversation}
          isActive={activeId === conversation.id}
        />
      ))}
    </>
  );
}

/** Single sidebar row for a conversation with rename, pin, and delete actions. */
function ChatItem({
  conversation,
  isActive,
}: {
  conversation: Conversation;
  isActive: boolean;
}) {
  const updateConversation = useUpdateConversation();
  const deleteConversation = useDeleteConversation(
    isActive ? conversation.id : undefined
  );
  const [renameOpen, setRenameOpen] = useState(false);
  const [title, setTitle] = useState(conversation.title);

  function handleRenameSubmit(event: React.FormEvent) {
    event.preventDefault();
    const next = title.trim();
    if (!next || next === conversation.title) {
      setRenameOpen(false);
      return;
    }
    updateConversation.mutate({ id: conversation.id, title: next });
    setRenameOpen(false);
  }

  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={isActive}
        tooltip={conversation.title}
        render={<Link href={`/c/${conversation.id}`} />}
        className={cn(isActive && "font-medium")}
      >
        {conversation.isPinned ? (
          <PinIcon className="size-3.5 shrink-0 text-primary" />
        ) : null}
        <span className="truncate">{conversation.title}</span>
      </SidebarMenuButton>

      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <SidebarMenuAction
              showOnHover
              className="data-popup-open:bg-sidebar-accent"
            />
          }
        >
          <MoreHorizontalIcon />
          <span className="sr-only">Chat actions</span>
        </DropdownMenuTrigger>
        <DropdownMenuContent side="right" align="start">
          <DropdownMenuItem
            onClick={() => {
              setTitle(conversation.title);
              setRenameOpen(true);
            }}
          >
            <PencilIcon />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() =>
              updateConversation.mutate({
                id: conversation.id,
                isPinned: !conversation.isPinned,
              })
            }
          >
            {conversation.isPinned ? <PinOffIcon /> : <PinIcon />}
            {conversation.isPinned ? "Unpin" : "Pin"}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            variant="destructive"
            onClick={() => deleteConversation.mutate(conversation.id)}
          >
            <Trash2Icon />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={setRenameOpen}>
        <DialogContent>
          <form onSubmit={handleRenameSubmit} className="grid gap-6">
            <DialogHeader>
              <DialogTitle>Rename chat</DialogTitle>
              <DialogDescription>
                Give this conversation a name you will recognize later.
              </DialogDescription>
            </DialogHeader>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              autoFocus
              maxLength={80}
            />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setRenameOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </SidebarMenuItem>
  );
}

/** Footer menu with upgrade nudge, pricing, theme toggle, and Clerk user account button. */
function SidebarFooterMenu() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarUpgradeNudge />
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton
          tooltip="Upgrade"
          render={<Link href="/pricing" />}
        >
          <SparklesIcon />
          <span>Upgrade</span>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <div className="flex items-center justify-between gap-2 px-1 py-1.5 group-data-[collapsible=icon]:justify-center">
          <span className="truncate text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
            Theme
          </span>
          <ModeToggle />
        </div>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <div className="flex items-center gap-2 px-1 py-1.5">
          <UserButton
            appearance={{
              elements: {
                avatarBox: "size-8",
              },
            }}
          />
          <span className="truncate text-sm text-muted-foreground group-data-[collapsible=icon]:hidden">
            Account
          </span>
        </div>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
