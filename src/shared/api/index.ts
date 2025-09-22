// API exports
export { AuthApi } from "./auth.api";
export { PresentationsApi } from "./presentations.api";

// Presentation Generation API exports
export * from "./presentation-generation";

// Images API exports
export * from "./images";

// Text API exports
export * from "./text";

// Infographics API exports
export * from "./infographics";

// Config exports
export { apiClient, API_BASE_URL, API_ENDPOINTS } from "./config";

// Types exports
export type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ForgotPasswordResponse,
  SocialAuthResponse,
  User,
  UserResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  SendEmailVerificationRequest,
  VerifyEmailChangeRequest,
  EmailVerificationResponse,
  Presentation,
  CreatePresentationRequest,
  UpdatePresentationRequest,
  SurveyRequest,
  SurveyResponse,
} from "./types";

// Hooks exports
export * from "../hooks/useAuth";
