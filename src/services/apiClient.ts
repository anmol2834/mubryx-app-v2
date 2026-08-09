import { Platform } from 'react-native';
import { ApiError } from '@/utils/errors';
import { Storage } from '@/services/storage';

const DEFAULT_API_URL = Platform.OS === 'android' ? 'http://10.0.2.2:3000/api/v1' : 'http://localhost:3000/api/v1';
const DEFAULT_TIMEOUT_MS = 15000; // 15 seconds default API timeout

const RAW_API_URL = process.env.EXPO_PUBLIC_API_URL || DEFAULT_API_URL;
export const API_BASE_URL = RAW_API_URL.endsWith('/v1')
  ? RAW_API_URL
  : `${RAW_API_URL.replace(/\/$/, '')}/v1`;

export interface ApiResponse<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
  apiError?: ApiError;
  statusCode?: number;
}

function extractErrorMessage(data: any, status: number): string {
  if (!data) {
    return `Request failed with status ${status}`;
  }

  if (typeof data === 'string') {
    return data;
  }

  // Check nested NestJS error object { success: false, error: { message: [...] | "..." } }
  const errObj = data.error && typeof data.error === 'object' ? data.error : data;

  const msg = errObj.message ?? data.message;
  if (Array.isArray(msg)) {
    return msg
      .map((m: any) => (typeof m === 'string' ? m : m?.message || JSON.stringify(m)))
      .join(', ');
  }

  if (typeof msg === 'string') {
    return msg;
  }

  if (typeof data.error === 'string') {
    return data.error;
  }

  if (data.error && typeof data.error.code === 'string') {
    return `Error: ${data.error.code}`;
  }

  if (typeof data === 'object' && typeof data.code === 'string') {
    return `Error: ${data.code}`;
  }

  return `Request failed with status ${status}`;
}

type OnTokenRefreshHandler = () => Promise<string | null>;
let tokenRefreshHandler: OnTokenRefreshHandler | null = null;

/**
 * Register a global callback to automatically refresh access tokens when a 401 status is encountered.
 */
export function setTokenRefreshHandler(handler: OnTokenRefreshHandler | null) {
  tokenRefreshHandler = handler;
}

export async function apiFetch<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
    body?: any;
    token?: string | null;
    headers?: Record<string, string>;
    signal?: AbortSignal;
    timeoutMs?: number;
    silent?: boolean;
    _isRetry?: boolean;
  } = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, token, headers = {}, signal, timeoutMs = DEFAULT_TIMEOUT_MS, silent = false, _isRetry = false } = options;

  const url = `${API_BASE_URL.replace(/\/$/, '')}/${endpoint.replace(/^\//, '')}`;

  const requestHeaders: Record<string, string> = {
    Accept: 'application/json',
    ...headers,
  };

  if (body !== undefined && body !== null && !requestHeaders['Content-Type']) {
    requestHeaders['Content-Type'] = 'application/json';
  }

  let authToken = token;
  if (!authToken) {
    authToken = await Storage.getItem('mubryx_access_token');
  }

  if (authToken) {
    requestHeaders.Authorization = `Bearer ${authToken}`;
  }

  const internalController = new AbortController();
  let timerId: any = null;

  if (timeoutMs > 0) {
    timerId = setTimeout(() => {
      internalController.abort('timeout');
    }, timeoutMs);
  }

  if (signal) {
    if (signal.aborted) {
      internalController.abort(signal.reason);
    } else {
      signal.addEventListener('abort', () => internalController.abort(signal.reason), { once: true });
    }
  }

  try {
    const response = await fetch(url, {
      method,
      headers: requestHeaders,
      body: body ? JSON.stringify(body) : undefined,
      signal: internalController.signal,
    });

    if (timerId) clearTimeout(timerId);

    // Attempt automatic token refresh on 401 Unauthorized before throwing an error
    const isRefreshEndpoint = endpoint.includes('auth/refresh');
    if (response.status === 401 && !_isRetry && !isRefreshEndpoint && tokenRefreshHandler) {
      const refreshedAccessToken = await tokenRefreshHandler();
      if (refreshedAccessToken) {
        return apiFetch<T>(endpoint, {
          ...options,
          token: refreshedAccessToken,
          _isRetry: true,
        });
      }
    }

    const rawText = await response.text().catch(() => '');
    let data: any = null;
    try {
      data = rawText ? JSON.parse(rawText) : null;
    } catch {
      data = rawText;
    }

    if (!response.ok) {
      if (!silent) {
        console.warn(`[apiClient] HTTP ${response.status} Error on ${method} ${url}`);
        console.warn(`[apiClient] Request Payload:`, JSON.stringify(body, null, 2));
        console.warn(`[apiClient] Raw Response Text:`, rawText);
        console.warn(`[apiClient] Parsed Response Data:`, JSON.stringify(data, null, 2));
      }
      const errorMessage = extractErrorMessage(data, response.status);
      const apiErr = new ApiError(errorMessage, response.status, data?.code);

      return {
        ok: false,
        error: errorMessage,
        apiError: apiErr,
        statusCode: response.status,
      };
    }

    // Automatically unwrap NestJS TransformInterceptor response format { success: true, data: ... }
    const responseData =
      data && typeof data === 'object' && data.success === true && data.data !== undefined
        ? data.data
        : data;

    return {
      ok: true,
      data: responseData,
      statusCode: response.status,
    };
  } catch (err: any) {
    if (timerId) clearTimeout(timerId);

    const isTimeout = internalController.signal.reason === 'timeout' || err?.message?.includes('timeout');
    const isAborted = internalController.signal.aborted || err?.name === 'AbortError';

    if (isTimeout) {
      const timeoutErr = new ApiError('Request timed out after 15 seconds', 408, 'TIMEOUT');
      return {
        ok: false,
        error: timeoutErr.message,
        apiError: timeoutErr,
        statusCode: 408,
      };
    }

    if (isAborted) {
      return {
        ok: false,
        error: 'Request aborted',
        apiError: new ApiError('Request aborted', 0, 'ABORTED'),
      };
    }

    const netErr = new ApiError(
      err?.message || 'Network request failed. Please check backend connection.',
      0,
      'NETWORK_ERROR'
    );

    return {
      ok: false,
      error: netErr.message,
      apiError: netErr,
    };
  }
}
