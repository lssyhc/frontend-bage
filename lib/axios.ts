import axios from 'axios';

const apiBaseURL = process.env.NEXT_PUBLIC_API_URL;

if (!apiBaseURL && process.env.NODE_ENV === 'production') {
    throw new Error('NEXT_PUBLIC_API_URL is required for production builds.');
}

const api = axios.create({
    baseURL: apiBaseURL ?? 'http://localhost:8000/api',
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    withCredentials: true,
});

export type ApiValidationErrors = Record<string, string[] | undefined>;

interface ApiErrorData {
    message?: string;
    errors?: ApiValidationErrors;
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorData>(error)) {
        return error.response?.data?.message ?? fallback;
    }

    return fallback;
}

export function getApiValidationErrors(
    error: unknown
): ApiValidationErrors | null {
    if (axios.isAxiosError<ApiErrorData>(error)) {
        return error.response?.data?.errors ?? null;
    }

    return null;
}

export default api;
