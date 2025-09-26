// Auth Types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

export interface AuthResponse {
  access_token: string;
  refresh_token?: string;
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
  access_token: string;
  refresh_token?: string;
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

export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
}

export interface ChangePasswordResponse {
  message: string;
}

export interface SendEmailVerificationRequest {
  newEmail: string;
}

export interface VerifyEmailChangeRequest {
  newEmail: string;
  code: string;
}

export interface EmailVerificationResponse {
  message: string;
}

// Presentation Types
export interface Presentation {
  id: string;
  title: string;
  description?: string;
  htmlContent: string;
  thumbnail?: string;
  isPublic: boolean;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePresentationRequest {
  title: string;
  description?: string;
  htmlContent: string;
  thumbnail?: string;
  isPublic?: boolean;
}

export interface UpdatePresentationRequest {
  title?: string;
  description?: string;
  htmlContent?: string;
  thumbnail?: string;
  isPublic?: boolean;
}

// Survey Types
export interface SurveyRequest {
  answers: Record<string, string>;
  isFirstTime?: boolean;
}

export interface SurveyResponse {
  message: string;
  pointsEarned: number;
}

export interface SurveyStatusResponse {
  hasCompletedSurvey: boolean;
  surveyData?: {
    id: string;
    answers: Record<string, string>;
    isCompleted: boolean;
    completedAt: string;
  };
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
  SURVEY: {
    STATUS: ["survey", "status"],
  },
} as const;
