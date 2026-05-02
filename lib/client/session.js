export const SESSION_USER_ID_KEY = "cmps350_phase2_current_user_id";

export function getCurrentUserId() {
    if (typeof window === "undefined") return null;
    const value = window.localStorage.getItem(SESSION_USER_ID_KEY);
    const id = Number(value);
    return Number.isInteger(id) && id > 0 ? id : null;
}

export function setCurrentUserId(userId) {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(SESSION_USER_ID_KEY, String(userId));
}

export function clearCurrentUserId() {
    if (typeof window === "undefined") return;
    window.localStorage.removeItem(SESSION_USER_ID_KEY);
}
