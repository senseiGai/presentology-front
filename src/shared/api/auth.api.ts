import { apiClient, API_ENDPOINTS } from "./config";
import type {
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  RefreshTokenRequest,
  User,
  SocialAuthResponse,
  UpdateProfileRequest,
  ChangePasswordRequest,
  ChangePasswordResponse,
  SendEmailVerificationRequest,
  VerifyEmailChangeRequest,
  EmailVerificationResponse,
  ForgotPasswordRequest,
  ResetPasswordRequest,
  ForgotPasswordResponse,
} from "./types";

export class AuthApi {
  // Авторизация по email и паролю
  static async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.LOGIN, data);
    return response.data;
  }

  // Регистрация нового пользователя
  static async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REGISTER, data);
    return response.data;
  }

  // Обновление токена
  static async refreshToken(data: RefreshTokenRequest): Promise<AuthResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.REFRESH, data);
    return response.data;
  }

  // Выход из системы
  static async logout(): Promise<void> {
    await apiClient.post(API_ENDPOINTS.AUTH.LOGOUT);
  }

  // Запрос на восстановление пароля
  static async forgotPassword(
    data: ForgotPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.FORGOT_PASSWORD,
      data
    );
    return response.data;
  }

  // Сброс пароля по токену
  static async resetPassword(
    data: ResetPasswordRequest
  ): Promise<ForgotPasswordResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.RESET_PASSWORD,
      data
    );
    return response.data;
  }

  // Получение профиля пользователя
  static async getProfile(): Promise<User> {
    const response = await apiClient.get(API_ENDPOINTS.AUTH.PROFILE);
    return response.data;
  }

  // Обновление профиля пользователя
  static async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await apiClient.patch(
      API_ENDPOINTS.USERS.UPDATE_PROFILE,
      data
    );
    return response.data;
  }

  // Изменение пароля
  static async changePassword(
    data: ChangePasswordRequest
  ): Promise<ChangePasswordResponse> {
    const response = await apiClient.patch(
      API_ENDPOINTS.USERS.CHANGE_PASSWORD,
      data
    );
    return response.data;
  }

  // Отправка кода для изменения email
  static async sendEmailVerification(
    data: SendEmailVerificationRequest
  ): Promise<EmailVerificationResponse> {
    const response = await apiClient.patch(
      API_ENDPOINTS.USERS.SEND_EMAIL_VERIFICATION,
      data
    );
    return response.data;
  }

  // Подтверждение изменения email
  static async verifyEmailChange(
    data: VerifyEmailChangeRequest
  ): Promise<User> {
    const response = await apiClient.patch(
      API_ENDPOINTS.USERS.VERIFY_EMAIL_CHANGE,
      data
    );
    return response.data;
  }

  // Загрузка аватара
  static async uploadAvatar(file: File): Promise<User> {
    const formData = new FormData();
    formData.append("avatar", file);

    const response = await apiClient.post(
      API_ENDPOINTS.USERS.UPLOAD_AVATAR,
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );
    return response.data;
  }

  // Удаление аватара
  static async deleteAvatar(): Promise<User> {
    const response = await apiClient.delete(API_ENDPOINTS.USERS.DELETE_AVATAR);
    return response.data;
  }

  // Google OAuth
  static async googleAuth(code: string): Promise<SocialAuthResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.GOOGLE, { code });
    return response.data;
  }

  // Yandex OAuth
  static async yandexAuth(code: string): Promise<SocialAuthResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.YANDEX, { code });
    return response.data;
  }

  // VK OAuth
  static async vkAuth(code: string): Promise<SocialAuthResponse> {
    const response = await apiClient.post(API_ENDPOINTS.AUTH.VK, { code });
    return response.data;
  }

  // Telegram OAuth
  static async telegramAuth(
    telegramData: unknown
  ): Promise<SocialAuthResponse> {
    const response = await apiClient.post(
      API_ENDPOINTS.AUTH.TELEGRAM,
      telegramData as Record<string, unknown>
    );
    return response.data;
  }

  // Получение URL для социальной авторизации
  static getGoogleAuthUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    return `${baseUrl}/auth/google`;
  }

  static getYandexAuthUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    return `${baseUrl}/auth/yandex`;
  }

  static getVkAuthUrl(): string {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL;
    return `${baseUrl}/auth/vk`;
  }
}
