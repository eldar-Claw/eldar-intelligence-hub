import axios, { AxiosInstance } from 'axios';
import { getBackendUrl } from './storage';
import { Report, Source, PaginatedResponse } from '../types';

let apiClient: AxiosInstance | null = null;

async function getClient(): Promise<AxiosInstance> {
  const baseURL = await getBackendUrl();
  if (!apiClient || apiClient.defaults.baseURL !== baseURL) {
    apiClient = axios.create({
      baseURL,
      timeout: 15000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNABORTED') {
          return Promise.reject(new Error('הבקשה נכשלה — זמן תגובה ארוך מדי'));
        }
        if (!error.response) {
          return Promise.reject(new Error('אין חיבור לשרת'));
        }
        return Promise.reject(error);
      }
    );
  }
  return apiClient;
}

export function resetClient(): void {
  apiClient = null;
}

// Reports
export async function getLatestReport(): Promise<Report | null> {
  const client = await getClient();
  const { data } = await client.get<Report | null>('/api/reports/latest');
  return data;
}

export async function getReports(page = 1, limit = 10): Promise<PaginatedResponse<Report>> {
  const client = await getClient();
  const { data } = await client.get<PaginatedResponse<Report>>('/api/reports', {
    params: { page, limit },
  });
  return data;
}

export async function getReport(id: number): Promise<Report> {
  const client = await getClient();
  const { data } = await client.get<Report>(`/api/reports/${id}`);
  return data;
}

export async function generateReport(): Promise<{ success: boolean; reportId: number }> {
  const client = await getClient();
  const { data } = await client.post<{ success: boolean; reportId: number }>('/api/reports/generate');
  return data;
}

// Sources
export async function getSources(): Promise<Source[]> {
  const client = await getClient();
  const { data } = await client.get<Source[]>('/api/sources');
  return data;
}

export async function addSource(source: { name: string; url: string; type: string; category: string }): Promise<Source> {
  const client = await getClient();
  const { data } = await client.post<Source>('/api/sources', source);
  return data;
}

export async function updateSource(id: number, updates: Partial<Source>): Promise<Source> {
  const client = await getClient();
  const { data } = await client.put<Source>(`/api/sources/${id}`, updates);
  return data;
}

export async function deleteSource(id: number): Promise<void> {
  const client = await getClient();
  await client.delete(`/api/sources/${id}`);
}

// Settings
export async function getSettings(): Promise<Record<string, string>> {
  const client = await getClient();
  const { data } = await client.get<Record<string, string>>('/api/settings');
  return data;
}

export async function updateSettings(settings: Record<string, string>): Promise<Record<string, string>> {
  const client = await getClient();
  const { data } = await client.put<Record<string, string>>('/api/settings', settings);
  return data;
}

// Health check
export async function checkConnection(): Promise<boolean> {
  try {
    const client = await getClient();
    await client.get('/api/settings', { timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}
