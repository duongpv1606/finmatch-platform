import { Column, CreateDateColumn, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

@Entity('direct_messages')
export class DirectMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  senderId: string;

  @Column()
  senderName: string;

  @Column()
  senderRole: string;

  @Column()
  @Index()
  receiverId: string;

  @Column()
  receiverName: string;

  @Column()
  receiverRole: string;

  @Column('text')
  text: string;

  @Column({ default: false })
  read: boolean;

  @CreateDateColumn()
  createdAt: Date;
}
