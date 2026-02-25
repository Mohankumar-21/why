import { Timestamp } from 'firebase/firestore';

export type Category = 'General' | 'Sports' | 'Spiritual' | 'Technology' | 'Life' | 'Health' | 'Business' | 'Entertainment' | 'Other';
export type SortOption = 'Trending' | 'Recent' | 'Oldest' | 'Top' | 'Most Discussed';

export interface Question {
  id: string;
  title: string;
  category: Category;
  author: string;
  createdAt: Timestamp;
  commentCount: number;
  upvotes: number;
  downvotes: number;
  score: number;
  trendingScore?: number;
}

export interface Comment {
  id: string;
  text: string;
  author: string;
  authorId: string;
  createdAt: Timestamp;
  likes: number;
  repliesCount: number;
}

export interface Reply {
  id: string;
  text: string;
  author: string;
  authorId: string;
  createdAt: Timestamp;
}
