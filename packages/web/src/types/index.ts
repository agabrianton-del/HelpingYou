/**
 * Core Type Definitions for HelpingYou Web
 */

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
}

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  HELPER = 'helper',
  USER = 'user',
}

// Request Types
export interface Request {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: RequestCategory;
  status: RequestStatus;
  priority: Priority;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum RequestCategory {
  TECHNICAL = 'technical',
  GENERAL = 'general',
  FEEDBACK = 'feedback',
  BUG = 'bug',
  FEATURE = 'feature',
}

export enum RequestStatus {
  OPEN = 'open',
  IN_PROGRESS = 'in_progress',
  RESOLVED = 'resolved',
  CLOSED = 'closed',
  REJECTED = 'rejected',
}

export enum Priority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Response Types
export interface Response {
  id: string;
  requestId: string;
  userId: string;
  content: string;
  helpfulness: number;
  createdAt: Date;
}

// Auth Context Types
export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  register: (data: RegisterData) => Promise<void>;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}
