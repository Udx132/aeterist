import React, { createContext, useState, useContext, useEffect, ReactNode, FC, useMemo, useCallback } from 'react';
import { User, Post, UserRole, GlobalMessage, Message, Scripture, CalendarEvent, Comment } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: { [key: string]: User };
  posts: Post[];
  comments: Comment[];
  globalMessages: GlobalMessage[];
  messages: Message[];
  scriptures: Scripture[];
  calendarEvents: CalendarEvent[];
  theme: string;
  getUserById: (id: string) => User | undefined;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  signup: (username: string, password: string) => Promise<boolean>;
  updateUser: (updatedData: Partial<User>) => Promise<void>;
  addPost: (post: Omit<Post, 'id' | 'userId' | 'username' | 'createdAt'>) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleDislikePost: (postId: string) => Promise<void>;
  addComment: (postId: string, content: string) => Promise<void>;
  deleteComment: (commentId: string) => Promise<void>;
  sendFriendRequest: (targetUsername: string) => Promise<void>;
  acceptFriendRequest: (requesterId: string) => Promise<void>;
  declineFriendRequest: (requesterId: string) => Promise<void>;
  removeFriend: (friendId: string) => Promise<void>;
  sendGlobalMessage: (text: string) => Promise<void>;
  deleteGlobalMessage: (messageId: string) => Promise<void>;
  sendMessage: (receiverId: string, text: string) => Promise<void>;
  updateScripture: (scripture: { id: string, title: string, content: string }) => Promise<void>;
  addCalendarEvent: (event: CalendarEvent) => Promise<void>;
  updateCalendarEvent: (event: CalendarEvent) => Promise<void>;
  deleteCalendarEvent: (date: string) => Promise<void>;
  updateUserRole: (username: string, role: UserRole) => Promise<void>;
  setTheme: (themeName: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const initialUser: User = {
  id: 'u1',
  username: 'lylylynni',
  password: 'Slay0789',
  bio: 'Beholder of Oculeum. Site Owner.',
  profilePicture: `https://picsum.photos/seed/lylylynni/200`,
  role: 'owner',
  friends: [],
  friendRequests: [],
};

const hydrateUsers = (users: { [key: string]: any }): { [key: string]: User } => {
    return Object.fromEntries(
        Object.values(users)
        .filter(u => u && u.id && u.username)
        .map(user => [user.username, {
            ...user,
            role: user.role || 'user',
            friends: Array.isArray(user.friends) ? user.friends : [],
            friendRequests: Array.isArray(user.friendRequests) ? user.friendRequests : [],
            profilePicture: user.profilePicture || null,
            bio: user.bio || '',
        }])
    );
};

const hydratePosts = (posts: any[]): Post[] => {
    return posts.map(post => ({
        ...post,
        likes: Array.isArray(post.likes) ? post.likes : [],
        dislikes: Array.isArray(post.dislikes) ? post.dislikes : [],
    }));
};

const safeParseArray = (key: string): any[] => {
    const storedValue = localStorage.getItem(key);
    if (!storedValue) return [];
    try {
        const parsed = JSON.parse(storedValue);
        if (Array.isArray(parsed)) {
            return parsed.filter(item => item && typeof item === 'object');
        }
        return [];
    } catch {
        return [];
    }
};

const getInitialState = () => {
    try {
        const storedUsers = localStorage.getItem('aeterist_users');
        let parsedUsers = null;
        if (storedUsers) parsedUsers = JSON.parse(storedUsers);
        
        const loadedUsers = (parsedUsers && typeof parsedUsers === 'object' && !Array.isArray(parsedUsers))
            ? parsedUsers
            : { [initialUser.username]: initialUser };
        
        const hydratedUsers = hydrateUsers(loadedUsers);
        
        const storedCurrentUser = localStorage.getItem('aeterist_currentUser');
        const loadedCurrentUser = storedCurrentUser ? JSON.parse(storedCurrentUser) : null;
        const currentUser = (loadedCurrentUser && hydratedUsers[loadedCurrentUser.username])
            ? hydratedUsers[loadedCurrentUser.username]
            : null;

        const storedTheme = localStorage.getItem('aeterist_theme');

        return {
            users: hydratedUsers,
            posts: hydratePosts(safeParseArray('aeterist_posts')),
            comments: safeParseArray('aeterist_comments'),
            currentUser,
            globalMessages: safeParseArray('aeterist_global_messages'),
            messages: safeParseArray('aeterist_messages'),
            scriptures: safeParseArray('aeterist_scriptures'),
            calendarEvents: safeParseArray('aeterist_calendar_events'),
            theme: storedTheme || 'theme-void',
        };
    } catch (error) {
        console.error("Failed to load from localStorage. Resetting state.", error);
        localStorage.clear();
        return {
            users: { [initialUser.username]: initialUser },
            posts: [],
            comments: [],
            currentUser: null,
            globalMessages: [],
            messages: [],
            scriptures: [],
            calendarEvents: [],
            theme: 'theme-void',
        };
    }
}

export const AuthProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const [initialState] = useState(getInitialState);
  
  const [users, setUsers] = useState<{ [key: string]: User }>(initialState.users);
  const [posts, setPosts] = useState<Post[]>(initialState.posts);
  const [comments, setComments] = useState<Comment[]>(initialState.comments);
  const [currentUser, setCurrentUser] = useState(initialState.currentUser);
  const [globalMessages, setGlobalMessages] = useState(initialState.globalMessages);
  const [messages, setMessages] = useState(initialState.messages);
  const [scriptures, setScriptures] = useState(initialState.scriptures);
  const [calendarEvents, setCalendarEvents] = useState(initialState.calendarEvents);
  const [theme, setThemeState] = useState(initialState.theme);

  useEffect(() => { localStorage.setItem('aeterist_users', JSON.stringify(users)); }, [users]);
  useEffect(() => { localStorage.setItem('aeterist_posts', JSON.stringify(posts)); }, [posts]);
  useEffect(() => { localStorage.setItem('aeterist_comments', JSON.stringify(comments)); }, [comments]);
  useEffect(() => { localStorage.setItem('aeterist_currentUser', JSON.stringify(currentUser)); }, [currentUser]);
  useEffect(() => { localStorage.setItem('aeterist_global_messages', JSON.stringify(globalMessages)); }, [globalMessages]);
  useEffect(() => { localStorage.setItem('aeterist_messages', JSON.stringify(messages)); }, [messages]);
  useEffect(() => { localStorage.setItem('aeterist_scriptures', JSON.stringify(scriptures)); }, [scriptures]);
  useEffect(() => { localStorage.setItem('aeterist_calendar_events', JSON.stringify(calendarEvents)); }, [calendarEvents]);
  useEffect(() => { localStorage.setItem('aeterist_theme', theme); }, [theme]);

  const usersById = useMemo(() => {
    return Object.fromEntries(
        (Object.values(users) as User[]).map(u => [u.id, u])
    );
  }, [users]);
  
  const getUserById = useCallback((id: string): User | undefined => {
    return usersById[id];
  }, [usersById]);

  const login = useCallback(async (username: string, password: string): Promise<boolean> => {
    const user = users[username];
    if (user && user.password === password) {
      setCurrentUser(user);
      return true;
    }
    return false;
  }, [users]);

  const logout = useCallback(() => {
    setCurrentUser(null);
  }, []);

  const signup = useCallback(async (username: string, password: string): Promise<boolean> => {
    if (users[username]) return false;
    const newUser: User = {
      id: `u${Date.now()}`,
      username,
      password,
      bio: 'New Aeterist disciple.',
      profilePicture: null,
      role: 'user',
      friends: [],
      friendRequests: [],
    };
    setUsers(prev => ({ ...prev, [username]: newUser }));
    setCurrentUser(newUser);
    return true;
  }, [users]);

  const updateUser = useCallback(async (updatedData: Partial<User>) => {
    if (!currentUser) return;
    const username = currentUser.username;
    setUsers(prev => {
        const userToUpdate = prev[username];
        if (!userToUpdate) return prev;
        const updatedUser = { ...userToUpdate, ...updatedData };
        return { ...prev, [username]: updatedUser };
    });
    setCurrentUser(prev => prev ? { ...prev, ...updatedData } : null);
  }, [currentUser]);
  
  const addPost = useCallback(async (post: Omit<Post, 'id' | 'userId' | 'username' | 'createdAt'>) => {
    if(!currentUser) return;
    const newPost: Post = { 
        ...post, 
        id: `p${Date.now()}`,
        userId: currentUser.id,
        username: currentUser.username,
        createdAt: Date.now(),
        likes: [],
        dislikes: []
    };
    setPosts(prev => [newPost, ...prev]);
  }, [currentUser]);
  
  const deletePost = useCallback(async (postId: string) => {
    if(!currentUser) return;
    const postToDelete = posts.find(p => p.id === postId);
    if (!postToDelete) return;
    const hasPermission = currentUser.id === postToDelete.userId || ['owner', 'co-owner', 'moderator'].includes(currentUser.role);
    if(hasPermission) {
        setPosts(prev => prev.filter(p => p.id !== postId));
        setComments(prev => prev.filter(c => c.postId !== postId));
    }
  }, [currentUser, posts]);

  const toggleLikePost = useCallback(async (postId: string) => {
    if (!currentUser) return;
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const postLikes = post.likes || [];
          const postDislikes = post.dislikes || [];
          const hasLiked = postLikes.includes(currentUser.id);
          const newLikes = hasLiked
            ? postLikes.filter(id => id !== currentUser.id)
            : [...postLikes, currentUser.id];
          const newDislikes = postDislikes.filter(id => id !== currentUser.id);
          return { ...post, likes: newLikes, dislikes: newDislikes };
        }
        return post;
      })
    );
  }, [currentUser]);

  const toggleDislikePost = useCallback(async (postId: string) => {
    if (!currentUser) return;
    setPosts(prevPosts =>
      prevPosts.map(post => {
        if (post.id === postId) {
          const postLikes = post.likes || [];
          const postDislikes = post.dislikes || [];
          const hasDisliked = postDislikes.includes(currentUser.id);
          const newDislikes = hasDisliked
            ? postDislikes.filter(id => id !== currentUser.id)
            : [...postDislikes, currentUser.id];
          const newLikes = postLikes.filter(id => id !== currentUser.id);
          return { ...post, likes: newLikes, dislikes: newDislikes };
        }
        return post;
      })
    );
  }, [currentUser]);

  const addComment = useCallback(async (postId: string, content: string) => {
    if (!currentUser) return;
    const newComment: Comment = {
      id: `c${Date.now()}`,
      postId,
      userId: currentUser.id,
      username: currentUser.username,
      content,
      createdAt: Date.now(),
    };
    setComments(prev => [...prev, newComment]);
  }, [currentUser]);

  const deleteComment = useCallback(async (commentId: string) => {
    if (!currentUser) return;
    const commentToDelete = comments.find(c => c.id === commentId);
    if (!commentToDelete) return;
    const hasPermission =
      currentUser.id === commentToDelete.userId ||
      ['owner', 'co-owner', 'moderator'].includes(currentUser.role);
    if (hasPermission) {
      setComments(prev => prev.filter(c => c.id !== commentId));
    }
  }, [currentUser, comments]);
  
  const sendFriendRequest = useCallback(async (targetUsername: string) => {
      if(!currentUser || currentUser.username === targetUsername) return;
      const targetUser = users[targetUsername];
      if (!targetUser || targetUser.friendRequests.includes(currentUser.id) || targetUser.friends.includes(currentUser.id)) return;
      const updatedTargetUser = { ...targetUser, friendRequests: [...targetUser.friendRequests, currentUser.id] };
      setUsers(prev => ({ ...prev, [targetUsername]: updatedTargetUser }));
  }, [currentUser, users]);

  const acceptFriendRequest = useCallback(async (requesterId: string) => {
      if(!currentUser) return;
      const requester = getUserById(requesterId);
      if(!requester) return;

      const updatedCurrentUser = { ...currentUser, 
          friends: [...currentUser.friends, requesterId],
          friendRequests: currentUser.friendRequests.filter(id => id !== requesterId)
      };
      const updatedRequester = { ...requester, friends: [...requester.friends, currentUser.id] };

      setCurrentUser(updatedCurrentUser);
      setUsers(prev => ({
          ...prev,
          [currentUser.username]: updatedCurrentUser,
          [requester.username]: updatedRequester
      }));
  }, [currentUser, getUserById]);
  
  const declineFriendRequest = useCallback(async (requesterId: string) => {
      if(!currentUser) return;
      const updatedCurrentUser = { ...currentUser, friendRequests: currentUser.friendRequests.filter(id => id !== requesterId) };
      setCurrentUser(updatedCurrentUser);
      setUsers(prev => ({ ...prev, [currentUser.username]: updatedCurrentUser }));
  }, [currentUser]);
  
  const removeFriend = useCallback(async (friendId: string) => {
      if(!currentUser) return;
      const friend = getUserById(friendId);
      if(!friend) return;
      
      const updatedCurrentUser = { ...currentUser, friends: currentUser.friends.filter(id => id !== friendId) };
      const updatedFriend = { ...friend, friends: friend.friends.filter(id => id !== currentUser.id) };

      setCurrentUser(updatedCurrentUser);
      setUsers(prev => ({
          ...prev,
          [currentUser.username]: updatedCurrentUser,
          [friend.username]: updatedFriend
      }));
  }, [currentUser, getUserById]);

  const sendGlobalMessage = useCallback(async (text: string) => {
      if(!currentUser) return;
      const newMessage: GlobalMessage = {
          id: `gm${Date.now()}`,
          senderId: currentUser.id,
          senderUsername: currentUser.username,
          senderProfilePicture: currentUser.profilePicture,
          text,
          timestamp: Date.now()
      };
      setGlobalMessages(prev => [...prev, newMessage]);
  }, [currentUser]);
  
  const deleteGlobalMessage = useCallback(async (messageId: string) => {
      if (!currentUser || !['owner', 'co-owner', 'moderator'].includes(currentUser.role)) return;
      setGlobalMessages(prev => prev.filter(msg => msg.id !== messageId));
  }, [currentUser]);
  
  const sendMessage = useCallback(async (receiverId: string, text: string) => {
      if(!currentUser) return;
      const newMessage: Message = {
          id: `m${Date.now()}`,
          senderId: currentUser.id,
          receiverId,
          text,
          timestamp: Date.now()
      };
      setMessages(prev => [...prev, newMessage]);
  }, [currentUser]);

  const updateScripture = useCallback(async (scripture: { id: string, title: string, content: string }) => {
      if(!currentUser || !['owner', 'co-owner', 'moderator'].includes(currentUser.role)) return;
      setScriptures(prev => {
          const existing = prev.find(s => s.id === scripture.id);
          if (existing) {
              return prev.map(s => s.id === scripture.id ? { ...existing, ...scripture } : s);
          }
          return [...prev, { ...scripture, authorId: currentUser.id, createdAt: Date.now() }];
      });
  }, [currentUser]);
  
  const addCalendarEvent = useCallback(async (event: CalendarEvent) => {
      if(!currentUser || !['owner', 'co-owner', 'moderator'].includes(currentUser.role)) return;
      setCalendarEvents(prev => [...prev, event]);
  }, [currentUser]);

  const updateCalendarEvent = useCallback(async (event: CalendarEvent) => {
      if(!currentUser || !['owner', 'co-owner', 'moderator'].includes(currentUser.role)) return;
      setCalendarEvents(prev => prev.map(e => e.date === event.date ? event : e));
  }, [currentUser]);

  const deleteCalendarEvent = useCallback(async (date: string) => {
      if(!currentUser || !['owner', 'co-owner', 'moderator'].includes(currentUser.role)) return;
      setCalendarEvents(prev => prev.filter(e => e.date !== date));
  }, [currentUser]);

  const updateUserRole = useCallback(async (username: string, role: UserRole) => {
      if (!currentUser || currentUser.role !== 'owner' || currentUser.username === username) return;
      const userToUpdate = users[username];
      if (!userToUpdate) return;
      const updatedUser = { ...userToUpdate, role };
      setUsers(prev => ({...prev, [username]: updatedUser}));
  }, [currentUser, users]);

  const setTheme = useCallback((themeName: string) => {
    setThemeState(themeName);
  }, []);
  
  const value = useMemo(() => ({
    currentUser, users, posts, comments, globalMessages, messages, scriptures, calendarEvents, theme, 
    getUserById, login, logout, signup, updateUser, addPost, deletePost, toggleLikePost, 
    toggleDislikePost, addComment, deleteComment, sendFriendRequest, acceptFriendRequest, 
    declineFriendRequest, removeFriend, sendGlobalMessage, deleteGlobalMessage, sendMessage, 
    updateScripture, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, updateUserRole, setTheme
  }), [
    currentUser, users, posts, comments, globalMessages, messages, scriptures, calendarEvents, theme,
    getUserById, login, logout, signup, updateUser, addPost, deletePost, toggleLikePost,
    toggleDislikePost, addComment, deleteComment, sendFriendRequest, acceptFriendRequest,
    declineFriendRequest, removeFriend, sendGlobalMessage, deleteGlobalMessage, sendMessage,
    updateScripture, addCalendarEvent, updateCalendarEvent, deleteCalendarEvent, updateUserRole, setTheme
  ]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
