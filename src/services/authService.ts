import { apiFetch, ApiResponse } from './apiClient';

export interface BackendUser {
  id: string;
  fullName: string;
  phone: string;
  email?: string | null;
  role?: string;
  avatar?: string | null;
  isPhoneVerified?: boolean;
  createdAt?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse extends AuthTokens {
  user: BackendUser;
  isNewUser: boolean;
}

export interface SendOtpResponse {
  message: string;
  phone: string;
  devOtp?: string;
  expiresIn?: number;
  resendAvailableIn?: number;
}

export const authService = {
  /**
   * Request 6-digit SMS OTP to be sent to a 10-digit mobile number
   */
  async sendOtp(phone: string): Promise<ApiResponse<SendOtpResponse>> {
    return apiFetch<SendOtpResponse>('auth/send-otp', {
      method: 'POST',
      body: { phone },
    });
  },

  /**
   * Verify 6-digit OTP code and sign in or create user.
   * Returns isNewUser: true if this is a first-time registration.
   */
  async verifyOtp(phone: string, code: string, fullName?: string): Promise<ApiResponse<AuthResponse>> {
    return apiFetch<AuthResponse>('auth/verify-otp', {
      method: 'POST',
      body: { phone, code, ...(fullName ? { fullName } : {}) },
    });
  },

  /**
   * Log out user (client clears tokens; server session expires naturally)
   */
  async logout(accessToken: string): Promise<ApiResponse<{ message: string }>> {
    return apiFetch<{ message: string }>('auth/logout', {
      method: 'POST',
      token: accessToken,
    });
  },

  /**
   * Rotate access & refresh tokens using a valid refresh token
   */
  async refreshTokens(refreshToken: string): Promise<ApiResponse<AuthTokens>> {
    return apiFetch<AuthTokens>('auth/refresh', {
      method: 'POST',
      token: refreshToken,
    });
  },

  /**
   * Get current user profile
   */
  async getProfile(accessToken: string): Promise<ApiResponse<BackendUser>> {
    return apiFetch<BackendUser>('users/me', {
      method: 'GET',
      token: accessToken,
    });
  },

  /**
   * Update current user profile attributes (e.g. fullName)
   */
  async updateProfile(accessToken: string, data: { fullName?: string; email?: string; avatar?: string }): Promise<ApiResponse<BackendUser>> {
    return apiFetch<BackendUser>('users/me', {
      method: 'PATCH',
      token: accessToken,
      body: data,
    });
  },
};
