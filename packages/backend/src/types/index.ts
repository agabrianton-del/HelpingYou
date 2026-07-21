/**
 * Core Type Definitions for HelpingYou
 */

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  role: UserRole;
  status: UserStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'admin',
  MODERATOR = 'moderator',
  HELPER = 'helper',
  USER = 'user',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  DELETED = 'deleted',
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
  assignedTo?: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
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
  helpfulness: number; // 0-5
  createdAt: Date;
  updatedAt: Date;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
  message?: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

// Pagination
export interface PaginationParams {
  page: number;
  limit: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

// Filter Types
export interface RequestFilter {
  status?: RequestStatus[];
  category?: RequestCategory[];
  priority?: Priority[];
  userId?: string;
  assignedTo?: string;
  createdAfter?: Date;
  createdBefore?: Date;
}

// Auth Types
export interface AuthCredentials {
  email: string;
  password: string;
}

export interface AuthToken {
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}

export interface AuthPayload {
  userId: string;
  email: string;
  role: UserRole;
}

// Notification Types
export enum NotificationType {
  REQUEST_CREATED = 'request_created',
  RESPONSE_RECEIVED = 'response_received',
  REQUEST_ASSIGNED = 'request_assigned',
  REQUEST_RESOLVED = 'request_resolved',
  USER_MENTIONED = 'user_mentioned',
}

export interface Notification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  relatedId?: string;
  read: boolean;
  createdAt: Date;
}
