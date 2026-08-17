"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SparklesIcon } from "lucide-react";

import { fetchChatQuota } from "@/features/billing/action/get-chat-quota";
import type { ChatQuota } from "@/features/billing/types";

export function SidebarUpgradeNudge() {
  const [quota, setQuota] = useState<ChatQuota | null>(null);

  useEffect(() => {
    void fetchChatQuota()
      .then(setQuota)
      .catch(() => {});
  }, []);

  if (!quota || quota.plan !== "FREE" || quota.remaining > 1) {
    return null;
  }

  return (
    <Link
      href="/pricing"
      className="mb-1 block rounded-2xl border border-primary/20 bg-primary/5 p-3 text-left transition-colors hover:bg-primary/10 group-data-[collapsible=icon]:hidden"
    >
      <p className="flex items-center gap-1.5 text-xs font-medium">
        <SparklesIcon className="size-3.5 text-primary" />
        {quota.remaining === 0
          ? "Free messages used"
          : "Running low on messages"}
      </p>
      <p className="mt-1 text-[11px] text-muted-foreground">
        Upgrade to Pro for unlimited chatting.
      </p>
    </Link>
  );
}
