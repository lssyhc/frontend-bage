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

function getValidationErrorMessages(
    errors: ApiValidationErrors | undefined
): string[] {
    const messages = new Set<string>();

    for (const fieldMessages of Object.values(errors ?? {})) {
        if (!Array.isArray(fieldMessages)) {
            continue;
        }

        for (const message of fieldMessages) {
            const trimmedMessage = message.trim();

            if (trimmedMessage) {
                messages.add(trimmedMessage);
            }
        }
    }

    return [...messages];
}

export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (axios.isAxiosError<ApiErrorData>(error)) {
        const validationMessages = getValidationErrorMessages(
            error.response?.data?.errors
        );

        if (validationMessages.length > 0) {
            return validationMessages.join('; ');
        }

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
