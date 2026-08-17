import { FREE_MESSAGE_LIMIT } from "@/features/billing/constants";
import type { ChatQuota } from "@/features/billing/types";
import { prisma } from "@/lib/db";

export { FREE_MESSAGE_LIMIT } from "@/features/billing/constants";
export type { ChatQuota } from "@/features/billing/types";

function buildFreeQuota(plan: "FREE" | "PRO", used: number): ChatQuota {
  const remaining = Math.max(0, FREE_MESSAGE_LIMIT - used);

  return {
    allowed: used < FREE_MESSAGE_LIMIT,
    used,
    limit: FREE_MESSAGE_LIMIT,
    remaining,
    plan,
  };
}

export async function getChatQuota(userId: string): Promise<ChatQuota> {
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
    select: { plan: true },
  });

  if (user.plan === "PRO") {
    return {
      allowed: true,
      used: 0,
      limit: Number.MAX_SAFE_INTEGER,
      remaining: Number.MAX_SAFE_INTEGER,
      plan: user.plan,
    };
  }

  const used = await countBillableUserMessages(userId);

  return buildFreeQuota(user.plan, used);
}

export async function countBillableUserMessages(userId: string): Promise<number> {
  return prisma.message.count({
    where: {
      role: "USER",
      status: "COMPLETE",
      conversation: { userId },
    },
  });
}
