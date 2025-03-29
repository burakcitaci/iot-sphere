import config from '../config/config';

class FetchClient {
  private baseUrl: string;
  private defaultHeaders: HeadersInit;

  constructor() {
    this.baseUrl = config.api.baseUrl;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
    };
  }

  private async getHeaders(): Promise<HeadersInit> {
    const token = localStorage.getItem('token');
    return {
      ...this.defaultHeaders,
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        window.location.href = '/login';
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }

  public async get<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      headers: await this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  public async post<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      headers: await this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  public async put<T>(url: string, data?: any, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      headers: await this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }

  public async delete<T>(url: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${url}`, {
      ...options,
      method: 'DELETE',
      headers: await this.getHeaders(),
    });
    return this.handleResponse<T>(response);
  }
}

export const fetchClient = new FetchClient(); 