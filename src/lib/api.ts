import {
  User,
  DashboardStats,
  Report,
  ReportStats,
  Ad,
  AdStats,
  ActivityLog,
  PaginatedResponse,
  SystemHealth,
  ReportStatus,
  ReportType,
  ReportPriority,
  AdStatus,
  ActivityType,
} from './types';

const DEFAULT_API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://civarimda.onrender.com/api';

class ApiClient {
  private baseUrl: string;

  constructor() {
    this.baseUrl = DEFAULT_API_URL;
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('civarimda_api_url');
      if (stored && !stored.includes('civarimda-api')) {
        this.baseUrl = stored;
      } else {
        localStorage.setItem('civarimda_api_url', DEFAULT_API_URL);
      }
    }
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
    if (typeof window !== 'undefined') {
      localStorage.setItem('civarimda_api_url', url);
    }
  }

  getBaseUrl(): string {
    return this.baseUrl;
  }

  private getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('civarimda_admin_token');
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('civarimda_admin_token', token);
    }
  }

  removeToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('civarimda_admin_token');
      localStorage.removeItem('civarimda_admin_user');
    }
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const cleanEndpoint = endpoint.startsWith('/') ? endpoint.slice(1) : endpoint;
    const url = typeof window !== 'undefined' ? `/api/proxy/${cleanEndpoint}` : `${this.baseUrl}/${cleanEndpoint}`;
    const token = this.getToken();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'x-target-url': this.baseUrl,
      ...(options.headers as Record<string, string>),
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (response.status === 401) {
        // Token expired or invalid
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/login')) {
          this.removeToken();
          window.location.href = '/login?expired=1';
        }
      }

      if (!response.ok) {
        let errorMessage = `HTTP Error ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          if (Array.isArray(errorMessage)) errorMessage = errorMessage.join(', ');
        } catch {
          // Response was not JSON
        }
        throw new Error(errorMessage);
      }

      // Handle 204 No Content
      if (response.status === 204) {
        return {} as T;
      }

      return await response.json();
    } catch (err: any) {
      console.error(`API Error [${endpoint}]:`, err);
      throw err;
    }
  }

  // --- Auth ---
  async login(email: string, password: string): Promise<{ accessToken: string; user: User }> {
    const res = await this.request<{ accessToken: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(res.accessToken);
    if (typeof window !== 'undefined') {
      localStorage.setItem('civarimda_admin_user', JSON.stringify(res.user));
    }
    return res;
  }

  async getMe(): Promise<User> {
    return this.request<User>('/users/me');
  }

  // --- Health ---
  async getHealth(): Promise<SystemHealth> {
    return this.request<SystemHealth>('/health');
  }

  // --- Dashboard ---
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/admin/dashboard');
  }

  // --- Users Management ---
  async getUsers(params: {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    isBanned?: boolean;
  }): Promise<PaginatedResponse<User>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.search) query.append('search', params.search);
    if (params.role) query.append('role', params.role);
    if (params.isBanned !== undefined) query.append('isBanned', params.isBanned.toString());

    return this.request<PaginatedResponse<User>>(`/admin/users?${query.toString()}`);
  }

  async getUserById(id: string): Promise<User> {
    return this.request<User>(`/admin/users/${id}`);
  }

  async banUser(id: string, data: { reason: string; durationDays?: number; isPermanent?: boolean }): Promise<any> {
    return this.request(`/admin/users/${id}/ban`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async unbanUser(id: string): Promise<any> {
    return this.request(`/admin/users/${id}/unban`, {
      method: 'POST',
    });
  }

  async warnUser(id: string, reason?: string): Promise<any> {
    return this.request(`/admin/users/${id}/warn`, {
      method: 'POST',
      body: JSON.stringify({ reason: reason || 'Topluluk kurallarını ihlal' }),
    });
  }

  async changeUserRole(id: string, role: string): Promise<any> {
    return this.request(`/admin/users/${id}/role`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  }

  async deletePost(id: string, reason?: string): Promise<any> {
    return this.request(`/admin/posts/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason: reason || 'Yönetici tarafından kaldırıldı' }),
    });
  }

  // --- Reports & Moderation ---
  async getReports(params: {
    page?: number;
    limit?: number;
    status?: ReportStatus;
    type?: ReportType;
    priority?: ReportPriority;
  }): Promise<PaginatedResponse<Report>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);
    if (params.type) query.append('type', params.type);
    if (params.priority) query.append('priority', params.priority);

    return this.request<PaginatedResponse<Report>>(`/reports?${query.toString()}`);
  }

  async getReportStats(): Promise<ReportStats> {
    return this.request<ReportStats>('/reports/statistics');
  }

  async updateReport(id: string, data: { status: ReportStatus; resolutionNote?: string }): Promise<Report> {
    return this.request<Report>(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  // --- Ads Management ---
  async getAds(params: { page?: number; limit?: number; status?: AdStatus }): Promise<PaginatedResponse<Ad>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.status) query.append('status', params.status);

    return this.request<PaginatedResponse<Ad>>(`/ads?${query.toString()}`);
  }

  async getAdStats(adId?: string): Promise<AdStats> {
    const query = adId ? `?adId=${adId}` : '';
    return this.request<AdStats>(`/ads/statistics${query}`);
  }

  async createAd(data: Partial<Ad>): Promise<Ad> {
    return this.request<Ad>('/ads', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateAd(id: string, data: Partial<Ad>): Promise<Ad> {
    return this.request<Ad>(`/ads/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteAd(id: string): Promise<any> {
    return this.request(`/ads/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Activity / Audit Logs ---
  async getActivityLogs(params: {
    page?: number;
    limit?: number;
    adminId?: string;
    activityType?: ActivityType;
  }): Promise<PaginatedResponse<ActivityLog>> {
    const query = new URLSearchParams();
    if (params.page) query.append('page', params.page.toString());
    if (params.limit) query.append('limit', params.limit.toString());
    if (params.adminId) query.append('adminId', params.adminId);
    if (params.activityType) query.append('activityType', params.activityType);

    return this.request<PaginatedResponse<ActivityLog>>(`/admin/activity-logs?${query.toString()}`);
  }
}

export const api = new ApiClient();
export default api;
