export interface Post {
  id: string;
  title: string;
  content: string;
  userId: string;
  username: string;
  createdAt: number;
  mediaUrl?: string;
  mediaType?: 'image' | 'audio' | 'video';
  likes?: string[];
  dislikes?: string[];
}

export interface Comment {
    id: string;
    postId: string;
    userId: string;
    username: string;
    content: string;
    createdAt: number;
}

export type UserRole = 'user' | 'moderator' | 'co-owner' | 'owner';

export interface User {
  id: string;
  username: string;
  password?: string;
  bio: string;
  profilePicture: string | null;
  role: UserRole;
  friends: string[];
  friendRequests: string[];
}

export interface GlobalMessage {
  id: string;
  senderId: string;
  senderUsername: string;
  senderProfilePicture: string | null;
  text: string;
  timestamp: number;
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  text: string;
  timestamp: number;
}

export interface Scripture {
  id: string;
  title: string;
  content: string;
  authorId: string;
  createdAt: number;
}

export interface CalendarEvent {
  date: string;
  title: string;
  description: string;
}

export type Route = 
  | { page: 'home' }
  | { page: 'profile' }
  | { page: 'viewProfile', username: string }
  | { page: 'globalChat' }
  | { page: 'chat', initialPartnerUsername?: string }
  | { page: 'scripture' }
  | { page: 'calendar' };
