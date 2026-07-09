import { authedFetch, mockDelay, USE_MOCK } from "./apiClient";

export interface ConversationSummary {
  userId: string;
  name: string;
  role: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

export interface DirectMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  receiverId: string;
  receiverName: string;
  receiverRole: string;
  text: string;
  read: boolean;
  createdAt: string;
}

export async function getConversations(): Promise<ConversationSummary[]> {
  if (USE_MOCK) return mockDelay([]);
  return authedFetch<ConversationSummary[]>("/messages/conversations");
}

export async function getThread(userId: string): Promise<DirectMessage[]> {
  if (USE_MOCK) return mockDelay([]);
  return authedFetch<DirectMessage[]>(`/messages/thread/${userId}`);
}

export async function sendMessage(toUserId: string, text: string): Promise<DirectMessage> {
  return authedFetch<DirectMessage>("/messages", {
    method: "POST",
    body: JSON.stringify({ toUserId, text }),
  });
}

export async function getUnreadCount(): Promise<number> {
  if (USE_MOCK) return mockDelay(0);
  const res = await authedFetch<{ count: number }>("/messages/unread-count");
  return res.count;
}
