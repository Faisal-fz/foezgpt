import {
  Progress,
  ProgressLabel,
  ProgressValue,
} from "@/components/ui/progress";
import { fetchChatQuota } from "@/features/billing/action/get-chat-quota";
import { PricingCards } from "@/features/billing/components/pricing-cards";
import { FREE_MESSAGE_LIMIT } from "@/features/billing/constants";

export default async function PricingPage() {
  const quota = await fetchChatQuota();
  const usagePercent =
    quota.plan === "FREE"
      ? Math.min(100, Math.round((quota.used / quota.limit) * 100))
      : 0;

  return (
    <div className="flex flex-1 flex-col items-center overflow-y-auto px-4 py-10 md:px-6">
      <div className="mx-auto w-full max-w-4xl space-y-12 text-center">
        <div className="space-y-3">
          <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-3xl font-semibold tracking-tight text-transparent md:text-4xl">
            Choose your plan
          </h1>
          <p className="mx-auto max-w-lg text-muted-foreground">
            Start free, then unlock unlimited chatting when you are ready.
          </p>
        </div>

        {quota.plan === "FREE" ? (
          <div className="mx-auto max-w-md rounded-2xl border bg-muted/40 px-4 py-3 text-left">
            <Progress value={usagePercent} className="gap-2">
              <ProgressLabel className="text-xs">
                You&apos;ve used {quota.used} of {quota.limit ?? FREE_MESSAGE_LIMIT} messages
              </ProgressLabel>
              <ProgressValue className="text-xs" />
            </Progress>
          </div>
        ) : null}

        <PricingCards quota={quota} />
      </div>
    </div>
  );
}
