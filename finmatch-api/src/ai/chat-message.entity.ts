import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('chat_messages')
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Groups messages into one conversation. Equal to the userId when logged
  // in, or a client-generated UUID for anonymous/guest sessions.
  @Column()
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
