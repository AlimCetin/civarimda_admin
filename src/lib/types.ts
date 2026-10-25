export type UserRole = 'user' | 'moderator' | 'admin' | 'super_admin';

export interface User {
  id: string;
  fullName: string;
  avatar: string | null;
  bio: string;
  role: UserRole;
  isVerified: boolean;
  warningCount: number;
  isPermanentlyBanned: boolean;
  bannedUntil: string | null;
  followers?: string[];
  following?: string[];
  blockedUsers?: string[];
  savedPosts?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  bannedUsers: number;
  warnedUsers: number;
}

export type ReportStatus = 'pending' | 'in_progress' | 'resolved' | 'rejected';
export type ReportType = 'user' | 'post' | 'comment' | 'message' | 'place' | 'campaign';
export type ReportPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Report {
  id: string;
  reporterId: string;
  reportedId: string;
  type: ReportType;
  reason: string;
  description?: string;
  status: ReportStatus;
  priority: ReportPriority;
  reviewedBy?: string | null;
  reviewedAt?: string | null;
  resolutionNote?: string | null;
  createdAt: string;
  updatedAt: string;
  reporter?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
  reportedUser?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface ReportStats {
  pending: number;
  in_progress: number;
  resolved: number;
  rejected: number;
  total: number;
}

export type AdStatus = 'draft' | 'active' | 'paused' | 'completed';

export interface Ad {
  id: string;
  title: string;
  description?: string;
  mediaUrl: string;
  mediaType?: 'image' | 'video';
  type?: 'image' | 'video';
  targetUrl?: string;
  linkUrl?: string;
  status: AdStatus;
  impressions?: number;
  clicks?: number;
  views?: number;
  impressionCount?: number;
  clickCount?: number;
  viewCount?: number;
  budget?: number;
  startDate?: string;
  endDate?: string;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AdStats {
  totalAds: number;
  activeAds: number;
  totalImpressions: number;
  totalClicks: number;
  totalViews: number;
  ctr: number;
}

export type ActivityType =
  | 'BAN_USER'
  | 'UNBAN_USER'
  | 'WARN_USER'
  | 'CHANGE_ROLE'
  | 'DELETE_POST'
  | 'DELETE_COMMENT'
  | 'UPDATE_REPORT'
  | 'CREATE_AD'
  | 'UPDATE_AD'
  | 'DELETE_AD';

export interface ActivityLog {
  id: string;
  adminId: string;
  activityType: ActivityType;
  targetId?: string;
  targetType?: string;
  reason?: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  createdAt: string;
  admin?: {
    id: string;
    fullName: string;
    avatar?: string;
  };
}

export interface PaginatedResponse<T> {
  data?: T[];
  users?: T[];
  reports?: T[];
  ads?: T[];
  logs?: T[];
  total: number;
  page: number;
  limit: number;
  totalPages?: number;
}

export interface SystemHealth {
  status: string;
  timestamp: string;
  database: {
    status: 'connected' | 'disconnected';
    latencyMs?: number;
  };
  memoryUsage?: {
    heapUsedMB: number;
    heapTotalMB: number;
    rssMB: number;
  };
  uptimeSeconds?: number;
  version?: string;
}

export interface Campaign {
  id: string;
  title: string;
  description: string;
  imageUrl?: string | null;
  city: string;
  businessName: string;
  discountRate: string;
  maxClaims?: number | null;
  currentClaims?: number;
  startDate?: string | null;
  endDate?: string | null;
  hasCode?: boolean;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number | null;
  userId?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Place {
  id: string;
  name: string;
  title?: string;
  description: string;
  imageUrl?: string | null;
  images?: string[];
  city: string;
  businessName?: string;
  category: string;
  address?: string;
  phone?: string;
  workingHours?: string;
  entryFee?: string;
  latitude?: number | null;
  longitude?: number | null;
  distance?: number | null;
  userId?: string;
  commentCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Feedback {
  id: string;
  userId?: string | null;
  userName: string;
  userEmail: string;
  rating: number;
  type: 'rating' | 'suggestion' | 'bug' | 'other';
  title?: string;
  message: string;
  deviceInfo?: string;
  status: 'pending' | 'reviewed' | 'resolved' | 'archived';
  adminNote?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface FeedbackStats {
  totalCount: number;
  avgRating: number;
  suggestionCount: number;
  bugCount: number;
  ratingCount: number;
  pendingCount: number;
}

export interface AppSetting {
  key: string;
  value: string;
  description: string;
  type: 'string' | 'number' | 'boolean' | 'json';
  isSecret: boolean;
  isPublic: boolean;
  updatedAt: string;
}

