// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName?: string;
  username?: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}

export interface SocialAuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  isNewUser: boolean;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName?: string;
  username?: string;
  avatar?: string;
  provider?: "email" | "google" | "yandex" | "telegram" | "vk";
  createdAt: string;
  updatedAt: string;
}

export interface UserResponse {
  id: string;
  email: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

export interface UpdateProfileRequest {
  firstName?: string;
  lastName?: string;
  avatar?: string;
}

// Presentation Types
export interface Presentation {
  id: string;
  title: string;
  description?: string;
  content?: any; // JSON content
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePresentationRequest {
  title: string;
  description?: string;
  content?: any;
}

export interface UpdatePresentationRequest {
  title?: string;
  description?: string;
  content?: any;
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  message: string;
  statusCode: number;
  error?: string;
}

// Query Keys for TanStack Query
export const QUERY_KEYS = {
  AUTH: {
    USER: ["auth", "user"],
  },
  USERS: {
    PROFILE: ["users", "profile"],
  },
  PRESENTATIONS: {
    LIST: ["presentations", "list"],
    DETAIL: (id: string) => ["presentations", "detail", id],
  },
} as const;
