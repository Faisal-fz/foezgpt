import { CheckIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FREE_MESSAGE_LIMIT } from "@/features/billing/constants";
import type { ChatQuota } from "@/features/billing/types";
import { cn } from "@/lib/utils";

const freeFeatures = [
  `${FREE_MESSAGE_LIMIT} messages total`,
  "Standard AI responses",
  "File attachments",
];

const proFeatures = [
  "Unlimited messages",
  "Priority responses",
  "Web search",
  "Early access to new features",
];

const faqs = [
  {
    question: "Can I keep my chats?",
    answer: "Yes. Upgrading keeps every conversation and attachment.",
  },
  {
    question: "When does Pro go live?",
    answer: "Checkout is coming soon. Pro can be enabled during beta.",
  },
];

type PricingCardsProps = {
  quota: ChatQuota;
};

export function PricingCards({ quota }: PricingCardsProps) {
  const isPro = quota.plan === "PRO";

  return (
    <div className="space-y-10">
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Free</CardTitle>
              {!isPro ? <Badge variant="secondary">Current</Badge> : null}
            </div>
            <CardDescription>For trying ChaiGPT</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            <p className="text-3xl font-semibold">
              $0
              <span className="text-sm font-normal text-muted-foreground">
                /forever
              </span>
            </p>
            <ul className="space-y-2">
              {freeFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <CheckIcon className="size-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" disabled>
              {isPro ? "Included in Pro" : "Current plan"}
            </Button>
          </CardFooter>
        </Card>

        <Card
          className={cn(
            "relative overflow-hidden border-primary/30 shadow-lg ring-primary/15"
          )}
        >
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-primary to-primary/40" />
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <CardTitle>Pro</CardTitle>
              <Badge>Recommended</Badge>
            </div>
            <CardDescription>Unlimited chatting</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-left">
            <div>
              <p className="text-3xl font-semibold">
                $9
                <span className="text-sm font-normal text-muted-foreground">
                  /month
                </span>
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Less than a coffee per week
              </p>
            </div>
            <ul className="space-y-2">
              {proFeatures.map((feature) => (
                <li key={feature} className="flex items-center gap-2 text-sm">
                  <CheckIcon className="size-4 shrink-0 text-primary" />
                  {feature}
                </li>
              ))}
            </ul>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled>
              {isPro ? "Active plan" : "Get Pro — Coming soon"}
            </Button>
          </CardFooter>
        </Card>
      </div>

      <div className="grid gap-4 text-left sm:grid-cols-2">
        {faqs.map((item) => (
          <div
            key={item.question}
            className="rounded-3xl border bg-muted/30 p-4"
          >
            <p className="text-sm font-medium">{item.question}</p>
            <p className="mt-1 text-sm text-muted-foreground">{item.answer}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
