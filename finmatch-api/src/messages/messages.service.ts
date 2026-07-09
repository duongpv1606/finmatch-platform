import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DirectMessage } from './direct-message.entity';
import { UsersService } from '../users/users.service';

export interface ConversationSummary {
  userId: string;
  name: string;
  role: string;
  lastMessage: string;
  lastMessageAt: string;
  unreadCount: number;
}

@Injectable()
export class MessagesService {
  constructor(
    @InjectRepository(DirectMessage) private readonly repo: Repository<DirectMessage>,
    private readonly users: UsersService,
  ) {}

  async send(
    senderId: string,
    senderName: string,
    senderRole: string,
    toUserId: string,
    text: string,
  ): Promise<DirectMessage> {
    if (senderId === toUserId) {
      throw new BadRequestException('Không thể tự nhắn tin cho chính mình');
    }
    const receiver = await this.users.findById(toUserId);
    if (!receiver) throw new BadRequestException('Không tìm thấy người nhận');

    const message = this.repo.create({
      senderId,
      senderName,
      senderRole,
      receiverId: toUserId,
      receiverName: receiver.name,
      receiverRole: receiver.role,
      text,
    });
    return this.repo.save(message);
  }

  /** Groups all messages involving this user into one row per conversation
   * partner, with the most recent message and a real unread count — not a
   * placeholder badge. */
  async getConversations(userId: string): Promise<ConversationSummary[]> {
    const messages = await this.repo
      .createQueryBuilder('m')
      .where('m.senderId = :userId OR m.receiverId = :userId', { userId })
      .orderBy('m.createdAt', 'DESC')
      .getMany();

    const byPartner = new Map<string, ConversationSummary>();
    for (const m of messages) {
      const isSender = m.senderId === userId;
      const partnerId = isSender ? m.receiverId : m.senderId;
      const partnerName = isSender ? m.receiverName : m.senderName;
      const partnerRole = isSender ? m.receiverRole : m.senderRole;

      if (!byPartner.has(partnerId)) {
        byPartner.set(partnerId, {
          userId: partnerId,
          name: partnerName,
          role: partnerRole,
          lastMessage: m.text,
          lastMessageAt: m.createdAt.toISOString(),
          unreadCount: 0,
        });
      }
      if (!isSender && !m.read) {
        byPartner.get(partnerId)!.unreadCount += 1;
      }
    }
    return Array.from(byPartner.values()).sort(
      (a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime(),
    );
  }

  /** Full thread with one specific person, and marks their messages to me
   * as read (matches normal chat-app "opening the thread reads it"
   * behavior). */
  async getThread(userId: string, partnerId: string): Promise<DirectMessage[]> {
    const thread = await this.repo
      .createQueryBuilder('m')
      .where(
        '(m.senderId = :userId AND m.receiverId = :partnerId) OR (m.senderId = :partnerId AND m.receiverId = :userId)',
        { userId, partnerId },
      )
      .orderBy('m.createdAt', 'ASC')
      .getMany();

    const unreadIds = thread.filter((m) => m.receiverId === userId && !m.read).map((m) => m.id);
    if (unreadIds.length > 0) {
      await this.repo.update(unreadIds, { read: true });
    }
    return thread;
  }

  async getTotalUnread(userId: string): Promise<number> {
    return this.repo.count({ where: { receiverId: userId, read: false } });
  }
}
