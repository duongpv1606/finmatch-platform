import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('community_comments')
export class CommunityComment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  @Index()
  postId: string;

  @Column()
  authorId: string;

  @Column()
  authorName: string;

  @Column()
  authorRole: string;

  @Column('text')
  text: string;

  @CreateDateColumn()
  createdAt: Date;
}
