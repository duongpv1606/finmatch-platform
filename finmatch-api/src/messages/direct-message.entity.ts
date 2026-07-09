import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('direct_messages')
export class DirectMessage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  senderId: string;

  @Column()
  senderName: string;

  @Column()
  senderRole: string;

  @Column()
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
