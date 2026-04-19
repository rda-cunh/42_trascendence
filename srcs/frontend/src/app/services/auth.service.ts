/**
 * Authentication Service
 * Handles all auth-related API calls and token management
 */

import { api } from "../lib/api";
import { User, AuthResponse, LoginForm, RegisterForm } from "../types";

const TOKEN_KEY = "auth_token";
const USER_KEY = "auth_user";

export const authService = {
  /**
   * Login user
   */
  async login(credentials: LoginForm): Promise<AuthResponse> {
    const response = await api.login({
      email: credentials.email,
      password: credentials.password,
    });

    // Store token and user
    this.setToken(response.token);
    this.setUser(response.user);

    return response;
  },

  /**
   * Register new user
   */
  async register(data: RegisterForm): Promise<AuthResponse> {
    const response = await api.register(data);

    // Store token and user
    this.setToken(response.token);
    this.setUser(response.user);

    return response;
  },

  /**
   * Logout user
   */
  logout(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem("registered_user"); // Clean up mock data
  },

  /**
   * Get current token
   */
  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  },

  /**
   * Set token
   */
  setToken(token: string): void {
    localStorage.setItem(TOKEN_KEY, token);
  },

  /**
   * Get current user
   */
  getUser(): User | null {
    const userJson = localStorage.getItem(USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  },

  /**
   * Set user
   */
  setUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return !!this.getToken();
  },

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getUser();
    return user?.role === role;
  },

  /**
   * Update user profile
   */
  async updateProfile(data: Partial<User>, token: string): Promise<User> {
    const updatedUser = await api.updateProfile(data, token);
    this.setUser(updatedUser);
    return updatedUser;
  },

  /**
   * Change password
   */
  async changePassword(oldPassword: string, newPassword: string, token: string): Promise<void> {
    return api.changePassword({ old_password: oldPassword, new_password: newPassword }, token);
  },
};
