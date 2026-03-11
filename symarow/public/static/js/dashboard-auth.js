/**
 * Optional: if the app stores JWT in localStorage (e.g. after Keycloak login),
 * set the app_token cookie so the server-rendered dashboard can read the role.
 * Call setCookieFromStorage() after login, or use a "Refresh with token" button.
 */

const TOKEN_KEY = 'app_token';
const COOKIE_NAME = 'app_token';
const COOKIE_MAX_AGE_DAYS = 1;

export function getStoredToken() {
    try {
        return localStorage.getItem(TOKEN_KEY);
    } catch {
        return null;
    }
}

export function setCookieFromStorage() {
    const token = getStoredToken();
    if (!token) return false;
    const maxAge = COOKIE_MAX_AGE_DAYS * 24 * 60 * 60;
    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${maxAge}; SameSite=Lax`;
    return true;
}

export function initDashboardAuth() {
    const guestHint = document.querySelector('.dashboard-guest');
    if (!guestHint) return;

    const token = getStoredToken();
    if (!token) return;

    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'nav-btn';
    btn.textContent = 'Use stored token and refresh';
    btn.addEventListener('click', () => {
        if (setCookieFromStorage()) {
            window.location.reload();
        }
    });

    const card = guestHint.querySelector('.dashboard-card');
    if (card) {
        const wrap = document.createElement('div');
        wrap.className = 'guest-token-actions';
        wrap.style.marginTop = '1rem';
        wrap.appendChild(btn);
        card.appendChild(wrap);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDashboardAuth);
} else {
    initDashboardAuth();
}
