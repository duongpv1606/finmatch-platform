import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chat_messages')
@Index(['role', 'createdAt'])
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Groups messages into one conversation. Equal to the userId when logged
  // in, or a client-generated UUID for anonymous/guest sessions.
  @Column()
  @Index()
  sessionId: string;

  @Column({ nullable: true })
  userId?: string;

  @Column({ type: 'enum', enum: ['user', 'assistant'] })
  role: 'user' | 'assistant';

  @Column('text')
  content: string;

  @CreateDateColumn()
  createdAt: Date;
}
