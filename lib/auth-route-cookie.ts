const AUTH_ROUTE_COOKIE = 'bage_auth';

function secureCookieAttribute() {
    if (typeof window === 'undefined') {
        return '';
    }

    return window.location.protocol === 'https:' ? '; Secure' : '';
}

export function setAuthRouteCookie() {
    document.cookie = `${AUTH_ROUTE_COOKIE}=1; Path=/; Max-Age=86400; SameSite=Lax${secureCookieAttribute()}`;
}

export function clearAuthRouteCookie() {
    document.cookie = `${AUTH_ROUTE_COOKIE}=; Path=/; Max-Age=0; SameSite=Lax${secureCookieAttribute()}`;
}

export { AUTH_ROUTE_COOKIE };
