"use server";
import { requireUser } from "@/features/auth/action/require-user";
import prisma from "@/lib/db";
import { revalidatePath } from "next/cache";

async function assertOwnConversation(conversationId: string, userId: string){
  const conversation = await prisma.conversation.findFirst({
    where:{
      id: conversationId,
      userId: userId
    }
  });
  if(!conversation) throw new Error("conversation not found");
  return conversation;
}

export async function listMessages(conversationId: string) {
  const user = await requireUser();
  const conversation = await assertOwnConversation(conversationId, user.id);
  const messages = await prisma.message.findMany({
    where:{
      conversationId: conversationId
    }
  });
  return messages;
}

export async function createMessage(conversationId: string, content: string) {
  const user = await requireUser();
  const conversation = await assertOwnConversation(conversationId, user.id);

  const trimmedContent = content.trim();
  if(trimmedContent.length === 0) throw new Error("content is required");

  const message = await prisma.message.create({
    data: {
      conversationId,
      role: "USER",
      status: "COMPLETE",
      content: trimmedContent,
    },
  });

  const shouldRename = conversation?.title === "New Chat" || conversation?.title.trim() === "";
  await prisma.conversation.update({
    where:{
      id: conversationId
    },
    data:{
      lastMessageAt: new Date(),
      ...(shouldRename ? {title: trimmedContent.length > 48 ? `${trimmedContent.slice(0, 48)}...` : trimmedContent}: {}),
    }
  });

  revalidatePath("/");
  revalidatePath(`/c/${conversationId}`);

  return message;
}

export async function updateMessage(messageId:string, content:string){
   const user = await requireUser();
   const trimmedContent = content.trim();
   if(trimmedContent.length === 0) throw new Error("content is required");
   const existing  = await prisma.message.findUnique({
    where:{
      id: messageId
    },
    include:{
      conversation: true
    }
   });

   if (!existing || existing.conversation.userId !== user.id) {
    throw new Error("Message not found");
  }

   const message = await prisma.message.update({
    where:{
      id: messageId
    },
    data:{
      content: trimmedContent
    }
   });
   revalidatePath(`/c/${existing.conversation.id}`);
   return message;
}

export async function deleteMessage(messageId: string) {
  const user = await requireUser();
  const existing  = await prisma.message.findUnique({
    where:{
      id: messageId
    },
    include:{
      conversation: true
    }
  });
  if (!existing || existing.conversation.userId !== user.id) {
    throw new Error("Message not found");
  }
  await prisma.message.delete({
    where:{
      id: messageId
    }
  });
  revalidatePath(`/c/${existing.conversation.id}`);
  return { success: true };
}
