import onboard from "@/features/auth/action/onboard";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { ChatShell } from "@/features/conversation/components/chat-shell";
const RootLayout = async ({ children }: { children: React.ReactNode }) => {
    const { userId } = await auth();
    if (!userId) {
        redirect("/sign-in");
    }
    await onboard();
    return (
        <ChatShell>
            {children}
        </ChatShell>
    )
}

export default RootLayout;