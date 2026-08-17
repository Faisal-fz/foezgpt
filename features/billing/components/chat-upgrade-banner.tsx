"use client";

import Link from "next/link";
import { CheckIcon, SparklesIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { FREE_MESSAGE_LIMIT } from "@/features/billing/constants";
import { cn } from "@/lib/utils";

type ChatUpgradeBannerProps = {
  used?: number;
  limit?: number;
};

export function ChatUpgradeBanner({
  used = FREE_MESSAGE_LIMIT,
  limit = FREE_MESSAGE_LIMIT,
}: ChatUpgradeBannerProps) {
  return (
    <div className="mx-auto w-full max-w-3xl animate-in fade-in slide-in-from-bottom-2 px-4 pb-4 duration-300 md:px-6">
      <div className="rounded-3xl bg-gradient-to-r from-primary/40 to-primary/10 p-px">
        <div className="rounded-[calc(var(--radius-3xl)-1px)] bg-background p-5">
          <div className="flex items-start gap-3">
            <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <SparklesIcon className="size-5" />
            </span>
            <div className="min-w-0 space-y-3">
              <div className="space-y-1">
                <h2 className="font-heading text-base font-medium">
                  You&apos;ve unlocked the full ChaiGPT experience
                </h2>
                <p className="text-sm text-muted-foreground">
                  {used}/{limit} free messages used. Upgrade to Pro for unlimited chatting.
                </p>
              </div>
              <ul className="space-y-1.5 text-sm">
                {[
                  "Unlimited messages",
                  "Web search",
                  "Priority responses",
                ].map((item) => (
                  <li key={item} className="flex items-center gap-2">
                    <CheckIcon className="size-4 shrink-0 text-primary" />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <Button render={<Link href="/pricing" />} nativeButton={false}>
                  Upgrade to Pro
                </Button>
                <Button
                  variant="ghost"
                  render={<Link href="/" />}
                  nativeButton={false}
                >
                  Maybe later
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ChatQuotaMeter({
  used,
  limit,
  remaining,
}: {
  used: number;
  limit: number;
  remaining: number;
}) {
  if (used <= 0) return null;

  const percent = Math.min(100, Math.round((used / limit) * 100));
  const isLastMessage = remaining === 1;

  return (
    <div className="mx-auto mb-2 w-full max-w-3xl px-4 md:px-6">
      <div
        className={cn(
          "rounded-2xl border bg-muted/40 px-4 py-2",
          isLastMessage && "border-amber-500/30 bg-amber-500/5"
        )}
      >
        <Progress
          value={percent}
          className={cn(
            "gap-2",
            isLastMessage &&
              "[&_[data-slot=progress-indicator]]:bg-amber-500"
          )}
        >
          <ProgressLabel className="text-xs">
            {used} of {limit} free messages
          </ProgressLabel>
          {isLastMessage ? (
            <Badge variant="secondary" className="ml-auto">
              1 message left
            </Badge>
          ) : (
            <ProgressValue className="text-xs" />
          )}
        </Progress>
      </div>
    </div>
  );
}

/** @deprecated Use ChatQuotaMeter */
export function ChatQuotaCounter({
  used,
  limit,
}: {
  used: number;
  limit: number;
}) {
  return (
    <ChatQuotaMeter
      used={used}
      limit={limit}
      remaining={Math.max(0, limit - used)}
    />
  );
}
