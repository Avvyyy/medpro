import { API_CONFIG, HTTP_STATUS, ERROR_CODES } from './config';

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  meta?: {
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
    timestamp: string;
    requestId: string;
  };
}

export interface ApiRequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  headers?: Record<string, string>;
  body?: any;
  params?: Record<string, any>;
  timeout?: number;
  retries?: number;
}

class ApiClient {
  private baseUrl: string;
  private defaultHeaders: Record<string, string>;
  private authToken: string | null = null;

  constructor() {
    this.baseUrl = `${API_CONFIG.BASE_URL}/api/${API_CONFIG.VERSION}`;
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    };
    
    // Load auth token from localStorage
    this.loadAuthToken();
  }

  private loadAuthToken(): void {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        this.setAuthToken(token);
      }
    } catch (error) {
      console.warn('Failed to load auth token from localStorage:', error);
    }
  }

  public setAuthToken(token: string): void {
    this.authToken = token;
    this.defaultHeaders['Authorization'] = `Bearer ${token}`;
    
    try {
      localStorage.setItem('authToken', token);
    } catch (error) {
      console.warn('Failed to save auth token to localStorage:', error);
    }
  }

  public clearAuthToken(): void {
    this.authToken = null;
    delete this.defaultHeaders['Authorization'];
    
    try {
      localStorage.removeItem('authToken');
    } catch (error) {
      console.warn('Failed to remove auth token from localStorage:', error);
    }
  }

  private buildUrl(endpoint: string, params?: Record<string, any>): string {
    let url = `${this.baseUrl}${endpoint}`;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          searchParams.append(key, String(value));
        }
      });
      
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return url;
  }

  private async makeRequest<T>(
    endpoint: string,
    options: ApiRequestOptions = {}
  ): Promise<ApiResponse<T>> {
    const {
      method = 'GET',
      headers = {},
      body,
      params,
      timeout = API_CONFIG.TIMEOUT,
      retries = API_CONFIG.RETRY_ATTEMPTS
    } = options;

    const url = this.buildUrl(endpoint, params);
    const requestHeaders = { ...this.defaultHeaders, ...headers };

    const requestOptions: RequestInit = {
      method,
      headers: requestHeaders,
      signal: AbortSignal.timeout(timeout)
    };

    if (body && method !== 'GET') {
      requestOptions.body = JSON.stringify(body);
    }

    let lastError: Error;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, requestOptions);
        return await this.handleResponse<T>(response);
      } catch (error) {
        lastError = error as Error;
        
        if (attempt < retries) {
          await this.delay(API_CONFIG.RETRY_DELAY * Math.pow(2, attempt));
        }
      }
    }

    throw lastError!;
  }

  private async handleResponse<T>(response: Response): Promise<ApiResponse<T>> {
    const contentType = response.headers.get('content-type');
    const isJson = contentType?.includes('application/json');

    let data: any;
    try {
      data = isJson ? await response.json() : await response.text();
    } catch (error) {
      data = null;
    }

    if (response.ok) {
      return {
        success: true,
        data: data?.data || data,
        meta: data?.meta
      };
    }

    // Handle specific error cases
    if (response.status === HTTP_STATUS.UNAUTHORIZED) {
      this.clearAuthToken();
      window.location.href = '/login';
    }

    const errorResponse: ApiResponse<T> = {
      success: false,
      error: {
        code: data?.error?.code || this.getErrorCodeFromStatus(response.status),
        message: data?.error?.message || response.statusText,
        details: data?.error?.details
      }
    };

    return errorResponse;
  }

  private getErrorCodeFromStatus(status: number): string {
    switch (status) {
      case HTTP_STATUS.BAD_REQUEST:
        return ERROR_CODES.VALIDATION_ERROR;
      case HTTP_STATUS.UNAUTHORIZED:
        return ERROR_CODES.AUTHENTICATION_FAILED;
      case HTTP_STATUS.FORBIDDEN:
        return ERROR_CODES.AUTHORIZATION_FAILED;
      case HTTP_STATUS.NOT_FOUND:
        return ERROR_CODES.RESOURCE_NOT_FOUND;
      case HTTP_STATUS.CONFLICT:
        return ERROR_CODES.DUPLICATE_RESOURCE;
      case HTTP_STATUS.INTERNAL_SERVER_ERROR:
        return ERROR_CODES.INTERNAL_ERROR;
      case HTTP_STATUS.SERVICE_UNAVAILABLE:
        return ERROR_CODES.SERVICE_UNAVAILABLE;
      default:
        return ERROR_CODES.INTERNAL_ERROR;
    }
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // HTTP method helpers
  public async get<T>(endpoint: string, params?: Record<string, any>): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'GET', params });
  }

  public async post<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'POST', body });
  }

  public async put<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PUT', body });
  }

  public async patch<T>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'PATCH', body });
  }

  public async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.makeRequest<T>(endpoint, { method: 'DELETE' });
  }
}

// Singleton instance
export const apiClient = new ApiClient();