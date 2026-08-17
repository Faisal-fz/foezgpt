import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <SignIn
      forceRedirectUrl="/"
      appearance={{
        variables: {
          colorPrimary: "oklch(0.457 0.24 277.023)",
          borderRadius: "1.25rem",
        },
        elements: {
          card: "shadow-xl ring-1 ring-foreground/5",
          headerTitle: "font-heading",
        },
      }}
    />
  );
}
