import { create } from "zustand";

interface AccountSettingsState {
  // UI state
  isOpen: boolean;
  isLoading: boolean;

  // Form data
  firstName: string;
  lastName: string;
  email: string;
  password: string;

  // Form errors
  firstNameError: boolean;
  lastNameError: boolean;
  emailError: boolean;
  passwordError: boolean;

  // Edit modes
  isEditingEmail: boolean;
  isEditingPassword: boolean;

  // Actions
  openPopup: () => void;
  closePopup: () => void;
  setLoading: (loading: boolean) => void;

  // Form setters
  setFirstName: (name: string) => void;
  setLastName: (name: string) => void;
  setEmail: (email: string) => void;
  setPassword: (password: string) => void;

  // Error setters
  setFirstNameError: (error: boolean) => void;
  setLastNameError: (error: boolean) => void;
  setEmailError: (error: boolean) => void;
  setPasswordError: (error: boolean) => void;

  // Edit mode setters
  setEditingEmail: (editing: boolean) => void;
  setEditingPassword: (editing: boolean) => void;

  // Initialize form with user data
  initializeForm: (userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) => void;

  // Validation
  validateForm: () => boolean;
  validateEmail: () => boolean;
  validatePassword: () => boolean;

  // Reset form
  resetForm: () => void;

  // Save changes
  saveChanges: () => Promise<boolean>;
}

// Validation functions
const validateName = (name: string): boolean => {
  // Name is optional, but if provided should be at least 2 chars
  return name.trim().length === 0 || name.trim().length >= 2;
};

const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  // Password is optional for updates, but if provided should be at least 6 chars
  return password.length === 0 || password.length >= 6;
};

export const useAccountSettingsStore = create<AccountSettingsState>(
  (set, get) => ({
    // Initial state
    isOpen: false,
    isLoading: false,
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    firstNameError: false,
    lastNameError: false,
    emailError: false,
    passwordError: false,
    isEditingEmail: false,
    isEditingPassword: false,

    // UI actions
    openPopup: () => set({ isOpen: true }),
    closePopup: () => set({ isOpen: false }),
    setLoading: (loading: boolean) => set({ isLoading: loading }),

    // Edit mode setters
    setEditingEmail: (editing: boolean) => set({ isEditingEmail: editing }),
    setEditingPassword: (editing: boolean) =>
      set({ isEditingPassword: editing }),

    // Form setters
    setFirstName: (firstName: string) => {
      set({ firstName });
      // Clear error when user starts typing or field becomes valid
      if (get().firstNameError) {
        const isValid =
          firstName.trim().length === 0 || firstName.trim().length >= 2;
        if (isValid) {
          set({ firstNameError: false });
        }
      }
    },

    setLastName: (lastName: string) => {
      set({ lastName });
      if (get().lastNameError) {
        const isValid =
          lastName.trim().length === 0 || lastName.trim().length >= 2;
        if (isValid) {
          set({ lastNameError: false });
        }
      }
    },

    setEmail: (email: string) => {
      set({ email });
      if (get().emailError && email.length > 0) {
        set({ emailError: false });
      }
    },

    setPassword: (password: string) => {
      set({ password });
      if (get().passwordError && password.length >= 6) {
        set({ passwordError: false });
      }
    },

    // Error setters
    setFirstNameError: (error: boolean) => set({ firstNameError: error }),
    setLastNameError: (error: boolean) => set({ lastNameError: error }),
    setEmailError: (error: boolean) => set({ emailError: error }),
    setPasswordError: (error: boolean) => set({ passwordError: error }),

    // Initialize form with user data
    initializeForm: (userData) => {
      set({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        password: "",
        firstNameError: false,
        lastNameError: false,
        emailError: false,
        passwordError: false,
      });
    },

    // Validation
    validateForm: () => {
      const state = get();
      const firstNameValid = validateName(state.firstName);
      const lastNameValid = validateName(state.lastName);
      const emailValid = validateEmail(state.email);
      const passwordValid = validatePassword(state.password);

      set({
        firstNameError: !firstNameValid,
        lastNameError: !lastNameValid,
        emailError: !emailValid,
        passwordError: !passwordValid,
      });

      return firstNameValid && lastNameValid && emailValid && passwordValid;
    },

    // Individual validation methods
    validateEmail: () => {
      const state = get();
      const isValid = validateEmail(state.email);
      set({ emailError: !isValid });
      return isValid;
    },

    validatePassword: () => {
      const state = get();
      const isValid = validatePassword(state.password);
      set({ passwordError: !isValid });
      return isValid;
    },

    // Reset form
    resetForm: () => {
      set({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        firstNameError: false,
        lastNameError: false,
        emailError: false,
        passwordError: false,
        isEditingEmail: false,
        isEditingPassword: false,
        isLoading: false,
      });
    },

    // Save changes
    saveChanges: async () => {
      const state = get();

      if (!state.validateForm()) {
        return false;
      }

      set({ isLoading: true });

      try {
        // Here you would make API call to update user data
        // const response = await UserApi.updateProfile({
        //   firstName: state.firstName,
        //   lastName: state.lastName,
        //   email: state.email,
        //   ...(state.password && { password: state.password })
        // });

        // Simulate API call
        await new Promise((resolve) => setTimeout(resolve, 1000));

        set({ isLoading: false });
        return true;
      } catch (error) {
        console.error("Error saving account settings:", error);
        set({ isLoading: false });
        return false;
      }
    },
  })
);
