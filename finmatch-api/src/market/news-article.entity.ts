import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('news_articles')
export class NewsArticle {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  title: string;

  @Column('text')
  summary: string;

  @Column({ nullable: true })
  imageUrl?: string;

  @Column()
  source: string;

  @Column({ unique: true })
  url: string;

  @Column()
  publishedAt: Date;

  @CreateDateColumn()
  createdAt: Date;
}
