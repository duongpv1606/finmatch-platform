import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CommunityPost } from './community-post.entity';
import { CommunityComment } from './community-comment.entity';
import { CommunityPostLike } from './community-post-like.entity';
import { CreateCommentDto, CreatePostDto } from './dto/community.dto';
import { AiService } from '../ai/ai.service';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(CommunityPost) private readonly posts: Repository<CommunityPost>,
    @InjectRepository(CommunityComment) private readonly comments: Repository<CommunityComment>,
    @InjectRepository(CommunityPostLike) private readonly likes: Repository<CommunityPostLike>,
    private readonly ai: AiService,
  ) {}

  async createPost(authorId: string, authorName: string, authorRole: string, dto: CreatePostDto) {
    const post = this.posts.create({ authorId, authorName, authorRole, ...dto });
    return this.posts.save(post);
  }

  async findAll(currentUserId?: string) {
    const posts = await this.posts.find({ order: { createdAt: 'DESC' }, take: 50 });
    const postIds = posts.map((p) => p.id);
    if (postIds.length === 0) return [];

    const allComments = await this.comments.find({ where: { postId: In(postIds) } });
    const allLikes = await this.likes.find({ where: { postId: In(postIds) } });

    return posts.map((p) => ({
      ...p,
      comments: allComments
        .filter((c) => c.postId === p.id)
        .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime()),
      likesCount: allLikes.filter((l) => l.postId === p.id).length,
      likedByMe: currentUserId ? allLikes.some((l) => l.postId === p.id && l.userId === currentUserId) : false,
    }));
  }

  async addComment(postId: string, authorId: string, authorName: string, authorRole: string, dto: CreateCommentDto) {
    const post = await this.posts.findOne({ where: { id: postId } });
    if (!post) throw new NotFoundException('Không tìm thấy bài viết');
    const comment = this.comments.create({ postId, authorId, authorName, authorRole, text: dto.text });
    return this.comments.save(comment);
  }

  /** Real toggle: like once, click again to unlike — enforced by the DB
   * unique constraint, not just a client-side counter like the original. */
  async toggleLike(postId: string, userId: string): Promise<{ liked: boolean; likesCount: number }> {
    const existing = await this.likes.findOne({ where: { postId, userId } });
    if (existing) {
      await this.likes.delete(existing.id);
    } else {
      await this.likes.save(this.likes.create({ postId, userId }));
    }
    const likesCount = await this.likes.count({ where: { postId } });
    return { liked: !existing, likesCount };
  }

  /** Real aggregation — ranks members by actual posts+comments authored,
   * not an invented leaderboard. */
  async getTopMembers(): Promise<{ name: string; role: string; score: number }[]> {
    const posts = await this.posts.find();
    const comments = await this.comments.find();
    const scoreByAuthor = new Map<string, { name: string; role: string; score: number }>();

    for (const p of posts) {
      const key = p.authorId;
      const entry = scoreByAuthor.get(key) ?? { name: p.authorName, role: p.authorRole, score: 0 };
      entry.score += 2; // a post counts more than a comment
      scoreByAuthor.set(key, entry);
    }
    for (const c of comments) {
      const key = c.authorId;
      const entry = scoreByAuthor.get(key) ?? { name: c.authorName, role: c.authorRole, score: 0 };
      entry.score += 1;
      scoreByAuthor.set(key, entry);
    }

    return Array.from(scoreByAuthor.values())
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);
  }

  /** Real counts of post types — not invented hashtags. */
  async getHotTopics(): Promise<{ type: string; count: number }[]> {
    const posts = await this.posts.find();
    const counts: Record<string, number> = { question: 0, share: 0, review: 0 };
    for (const p of posts) counts[p.type] = (counts[p.type] ?? 0) + 1;
    return Object.entries(counts).map(([type, count]) => ({ type, count }));
  }

  /** Real AI summary of the most recent actual post texts — replaces the
   * original's hardcoded "[AI tổng hợp]" placeholder string with a real
   * LLM call grounded in real community content. */
  async getAiSummary(): Promise<string> {
    const posts = await this.posts.find({ order: { createdAt: 'DESC' }, take: 10 });
    if (posts.length === 0) {
      return 'Chưa có bài viết nào trong cộng đồng để tổng hợp.';
    }
    const content = posts.map((p) => `- (${p.type}) ${p.text}`).join('\n');
    try {
      return await this.ai.complete(
        `Tóm tắt 3-4 câu các chủ đề đang được thảo luận nhiều nhất trong cộng đồng tài chính này:\n${content}`,
        'Bạn tóm tắt ngắn gọn, khách quan, không bịa thêm nội dung ngoài các bài viết được cung cấp.',
      );
    } catch {
      return `Cộng đồng hiện có ${posts.length} bài viết gần đây, chủ yếu về ${posts[0].type === 'question' ? 'các câu hỏi tư vấn' : 'chia sẻ kinh nghiệm'}.`;
    }
  }
}
