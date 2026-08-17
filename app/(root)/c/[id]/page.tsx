import { loadChatMessages } from '@/features/ai/action/chat-store';
import { fetchChatQuota } from '@/features/billing/action/get-chat-quota';
import { getConversation } from '@/features/conversation/action/conversation-actions';
import { ConversationView } from '@/features/conversation/components/conversation-view';
import { notFound } from 'next/navigation';
import React from 'react'

type ConversationPageProps = {
    params: Promise<{ id: string }>;
  };

/**
 * Conversation page — loads messages and renders the chat UI for a given ID.
 */
const page = async({params}:ConversationPageProps) => {
    const {id} = await params;

    try {
      await getConversation(id)
    } catch (error) {
      notFound()
    }

    const [initialMessages, initialQuota] = await Promise.all([
      loadChatMessages(id),
      fetchChatQuota(),
    ]);

  return (
    <ConversationView
      key={id}
      conversationId={id}
      initialMessages={initialMessages}
      initialQuota={initialQuota}
    />
  )
}

export default page