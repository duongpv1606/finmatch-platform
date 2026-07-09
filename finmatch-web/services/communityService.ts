import { USE_MOCK, apiFetch, authedFetch, mockDelay } from "./apiClient";

export type PostType = "question" | "share" | "review";

export interface CommunityComment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  text: string;
  createdAt: string;
}

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  type: PostType;
  text: string;
  createdAt: string;
  comments: CommunityComment[];
  likesCount: number;
  likedByMe: boolean;
}

export async function getPosts(): Promise<CommunityPost[]> {
  if (USE_MOCK) return mockDelay([]);
  return apiFetch<CommunityPost[]>("/community/posts");
}

export async function createPost(type: PostType, text: string): Promise<CommunityPost> {
  return authedFetch<CommunityPost>("/community/posts", {
    method: "POST",
    body: JSON.stringify({ type, text }),
  });
}

export async function addComment(postId: string, text: string): Promise<CommunityComment> {
  return authedFetch<CommunityComment>(`/community/posts/${postId}/comments`, {
    method: "POST",
    body: JSON.stringify({ text }),
  });
}

export async function toggleLike(postId: string): Promise<{ liked: boolean; likesCount: number }> {
  return authedFetch(`/community/posts/${postId}/like`, { method: "POST" });
}

export async function getTopMembers(): Promise<{ name: string; role: string; score: number }[]> {
  if (USE_MOCK) return mockDelay([]);
  return apiFetch("/community/top-members");
}

export async function getHotTopics(): Promise<{ type: string; count: number }[]> {
  if (USE_MOCK) return mockDelay([]);
  return apiFetch("/community/hot-topics");
}

export async function getAiSummary(): Promise<string> {
  if (USE_MOCK) return mockDelay("Chế độ demo — kết nối backend thật để xem tổng hợp AI.");
  const res = await apiFetch<{ summary: string }>("/community/ai-summary");
  return res.summary;
}
