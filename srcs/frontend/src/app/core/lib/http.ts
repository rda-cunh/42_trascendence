/* eslint-disable @typescript-eslint/no-explicit-any */

export const API_URL = "/api";

export interface ApiError {
  detail?: string;
  message?: string;
  [key: string]: any;
}

export interface RequestOptions {
  retryOnUnauthorized?: boolean;
}

export function pickFirstErrorValue(value: unknown): string | null {
  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const nested = pickFirstErrorValue(entry);
      if (nested) return nested;
    }
    return null;
  }

  if (value && typeof value === "object") {
    for (const nestedValue of Object.values(value as Record<string, unknown>)) {
      const nested = pickFirstErrorValue(nestedValue);
      if (nested) return nested;
    }
  }

  return null;
}

export class HttpClient {
  protected token: string | null = null;
  private tokenChangeHandler: ((token: string | null) => void) | null = null;

  setToken(token: string | null) {
    this.token = token;
  }

  setTokenChangeHandler(handler: ((token: string | null) => void) | null) {
    this.tokenChangeHandler = handler;
  }

  protected getTokenChangeHandler() {
    return this.tokenChangeHandler;
  }

  protected async request<T>(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body?: any,
    options: RequestOptions = {}
  ): Promise<T> {
    const response = await this.fetchJson(method, path, body);
    const data = await response.json().catch(() => ({}));

    if (response.status === 401 && this.token && options.retryOnUnauthorized !== false) {
      const refreshed = await this.refresh().catch(() => null);
      const newToken = this.getAccessTokenFromResponse(refreshed);

      if (newToken) {
        this.setToken(newToken);
        this.tokenChangeHandler?.(newToken);
        const retryResponse = await this.fetchJson(method, path, body);
        const retryData = await retryResponse.json().catch(() => ({}));

        if (!retryResponse.ok) {
          throw new Error(this.getErrorMessage(retryData, retryResponse.statusText));
        }

        return retryData;
      }
    }

    if (!response.ok) {
      throw new Error(this.getErrorMessage(data, response.statusText));
    }

    return data;
  }

  protected fetchJson(
    method: "GET" | "POST" | "PUT" | "PATCH" | "DELETE",
    path: string,
    body?: any
  ) {
    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    return fetch(`${API_URL}${path}`, {
      method,
      headers,
      credentials: "include",
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  protected getErrorMessage(data: any, fallback: string) {
    const detail = pickFirstErrorValue(data?.detail);
    if (detail) return detail;

    const message = pickFirstErrorValue(data?.message);
    if (message) return message;

    const error = pickFirstErrorValue(data?.error);
    if (error) return error;

    const nonFieldErrors = pickFirstErrorValue(data?.non_field_errors);
    if (nonFieldErrors) return nonFieldErrors;

    const fieldError = pickFirstErrorValue(data);
    if (fieldError) return fieldError;

    return fallback || "Request failed";
  }

  /** Overridden by ApiClient for token refresh retry. */
  protected refresh(): Promise<any> {
    return Promise.reject(new Error("Not implemented"));
  }

  /** Overridden by ApiClient to parse refresh response. */
  protected getAccessTokenFromResponse(_data: any): string | null {
    return null;
  }
}
