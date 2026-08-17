import { CheckIcon, SparklesIcon } from "lucide-react";

const highlights = [
  "Ask anything and get streaming answers",
  "Attach files, photos, and PDFs",
  "Search the web when you need fresh sources",
];

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="grid min-h-svh md:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-gradient-to-br from-primary via-primary/80 to-primary/50 p-10 text-primary-foreground md:flex md:flex-col md:justify-between">
        <div className="flex items-center gap-3 text-lg font-semibold tracking-tight">
          <span className="flex size-10 items-center justify-center rounded-xl bg-white/15 text-xl">
            F
          </span>
          FoezGPT
        </div>
        <div className="space-y-6">
          <div className="space-y-3">
            <p className="inline-flex items-center gap-2 text-sm text-primary-foreground/80">
              <SparklesIcon className="size-4" />
              Your friendly AI workspace
            </p>
            <h1 className="max-w-sm font-heading text-4xl leading-tight font-medium">
              Think, write, and ship with a calmer kind of chat.
            </h1>
          </div>
          <ul className="space-y-3 text-sm text-primary-foreground/90">
            {highlights.map((item) => (
              <li key={item} className="flex items-center gap-2">
                <CheckIcon className="size-4 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-sm text-primary-foreground/70">
          Sign in to continue your conversations.
        </p>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
};

export default AuthLayout;
