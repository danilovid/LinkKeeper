import { API_BASE_URL } from '../config';
import { Link, CreateLinkInput, UpdateLinkInput, ViewStats } from '../types';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(errorText || `HTTP error! status: ${response.status}`);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json();
  }

  async createLink(input: CreateLinkInput): Promise<Link> {
    return this.request<Link>('/links', {
      method: 'POST',
      body: JSON.stringify(input),
    });
  }

  async getLink(id: string): Promise<Link> {
    return this.request<Link>(`/links/${id}`);
  }

  async listLinks(limit: number = 50, offset: number = 0): Promise<Link[]> {
    return this.request<Link[]>(`/links?limit=${limit}&offset=${offset}`);
  }

  async getRandomLink(resource?: string): Promise<Link> {
    const query = resource ? `?resource=${encodeURIComponent(resource)}` : '';
    return this.request<Link>(`/links/random${query}`);
  }

  async updateLink(id: string, input: UpdateLinkInput): Promise<Link> {
    return this.request<Link>(`/links/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    });
  }

  async deleteLink(id: string): Promise<void> {
    return this.request<void>(`/links/${id}`, {
      method: 'DELETE',
    });
  }

  async markViewed(id: string): Promise<Link> {
    return this.request<Link>(`/links/${id}/viewed`, {
      method: 'POST',
    });
  }

  async getViewStats(days: number = 53): Promise<ViewStats[]> {
    return this.request<ViewStats[]>(`/stats/views?days=${days}`);
  }
}

export const apiClient = new ApiClient(API_BASE_URL);
