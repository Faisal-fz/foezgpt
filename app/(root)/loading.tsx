import { Skeleton } from "@/components/ui/skeleton";

export default function RootLoading() {
  return (
    <div className="flex h-full min-h-0 flex-1 flex-col">
      <header className="flex h-14 shrink-0 items-center gap-2 border-b px-3">
        <Skeleton className="size-8" />
        <Skeleton className="h-4 w-40" />
      </header>
      <div className="flex flex-1 flex-col gap-6 p-6">
        <Skeleton className="h-16 w-2/3 self-end rounded-3xl" />
        <Skeleton className="h-24 w-3/4 rounded-3xl" />
        <Skeleton className="h-16 w-1/2 self-end rounded-3xl" />
      </div>
      <div className="px-4 pb-4 md:px-6">
        <Skeleton className="mx-auto h-14 w-full max-w-3xl rounded-3xl" />
      </div>
    </div>
  );
}
