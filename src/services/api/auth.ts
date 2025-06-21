import { apiClient, ApiResponse } from './client';
import { API_ENDPOINTS } from './config';
import { User } from '../../types/database';

export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

export interface RegisterRequest {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  role: 'doctor' | 'nurse' | 'admin';
  phone?: string;
  licenseNumber?: string;
  specialization?: string;
  department?: string;
  hospitalId?: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresAt: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  password: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

class AuthService {
  public async login(credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.LOGIN, credentials);
    
    if (response.success && response.data) {
      apiClient.setAuthToken(response.data.token);
      this.storeUserData(response.data.user);
    }
    
    return response;
  }

  public async logout(): Promise<ApiResponse<void>> {
    const response = await apiClient.post<void>(API_ENDPOINTS.AUTH.LOGOUT);
    
    // Clear local data regardless of API response
    apiClient.clearAuthToken();
    this.clearUserData();
    
    return response;
  }

  public async register(userData: RegisterRequest): Promise<ApiResponse<LoginResponse>> {
    const response = await apiClient.post<LoginResponse>(API_ENDPOINTS.AUTH.REGISTER, userData);
    
    if (response.success && response.data) {
      apiClient.setAuthToken(response.data.token);
      this.storeUserData(response.data.user);
    }
    
    return response;
  }

  public async refreshToken(): Promise<ApiResponse<RefreshTokenResponse>> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    const response = await apiClient.post<RefreshTokenResponse>(API_ENDPOINTS.AUTH.REFRESH, {
      refreshToken
    });
    
    if (response.success && response.data) {
      apiClient.setAuthToken(response.data.token);
    }
    
    return response;
  }

  public async forgotPassword(request: ForgotPasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, request);
  }

  public async resetPassword(request: ResetPasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.RESET_PASSWORD, request);
  }

  public async changePassword(request: ChangePasswordRequest): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.USERS.CHANGE_PASSWORD, request);
  }

  public async verifyEmail(token: string): Promise<ApiResponse<void>> {
    return apiClient.post<void>(API_ENDPOINTS.AUTH.VERIFY_EMAIL, { token });
  }

  public getCurrentUser(): User | null {
    try {
      const userData = localStorage.getItem('currentUser');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.warn('Failed to get current user from localStorage:', error);
      return null;
    }
  }

  public isAuthenticated(): boolean {
    const token = localStorage.getItem('authToken');
    const user = this.getCurrentUser();
    return !!(token && user);
  }

  public hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  public hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  private storeUserData(user: User): void {
    try {
      localStorage.setItem('currentUser', JSON.stringify(user));
    } catch (error) {
      console.warn('Failed to store user data in localStorage:', error);
    }
  }

  private clearUserData(): void {
    try {
      localStorage.removeItem('currentUser');
      localStorage.removeItem('refreshToken');
    } catch (error) {
      console.warn('Failed to clear user data from localStorage:', error);
    }
  }

  private getRefreshToken(): string | null {
    try {
      return localStorage.getItem('refreshToken');
    } catch (error) {
      console.warn('Failed to get refresh token from localStorage:', error);
      return null;
    }
  }
}

export const authService = new AuthService();