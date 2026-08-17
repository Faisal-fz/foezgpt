import Link from "next/link";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <p className="text-sm font-medium text-primary">404</p>
      <h1 className="font-heading text-2xl font-medium tracking-tight">
        This chat drifted off
      </h1>
      <p className="max-w-sm text-sm text-muted-foreground">
        The conversation you are looking for is gone or you do not have access.
      </p>
      <Button render={<Link href="/" />} nativeButton={false}>
        Back to chat
      </Button>
    </div>
  );
}
