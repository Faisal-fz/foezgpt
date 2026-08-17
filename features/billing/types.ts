export type ChatQuota = {
  allowed: boolean;
  used: number;
  limit: number;
  remaining: number;
  plan: "FREE" | "PRO";
};
