import { Skeleton } from "@/components/ui/skeleton";

export default function ConversationLoading() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
        <Skeleton className="size-8" />
        <div className="space-y-1.5">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="h-3 w-28" />
        </div>
      </header>
      <div className="flex flex-1 flex-col gap-6 overflow-hidden p-6">
        <Skeleton className="h-14 w-1/2 self-end rounded-3xl" />
        <Skeleton className="h-28 w-3/4 rounded-3xl" />
        <Skeleton className="h-14 w-2/5 self-end rounded-3xl" />
        <Skeleton className="h-20 w-2/3 rounded-3xl" />
      </div>
    </div>
  );
}
