"use server";

import { requireUser } from "@/features/auth/action/require-user";
import { getChatQuota } from "@/features/billing/utils/chat-quota";

export async function fetchChatQuota() {
  const user = await requireUser();
  return getChatQuota(user.id);
}
