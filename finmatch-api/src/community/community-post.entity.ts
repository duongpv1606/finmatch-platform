import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
} from 'typeorm';

export type PostType = 'question' | 'share' | 'review';

@Entity('community_posts')
export class CommunityPost {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  authorId: string;

  @Column()
  authorName: string;

  @Column()
  authorRole: string;

  @Column({ type: 'enum', enum: ['question', 'share', 'review'], default: 'share' })
  type: PostType;

  @Column('text')
  text: string;

  @CreateDateColumn()
  createdAt: Date;
}
