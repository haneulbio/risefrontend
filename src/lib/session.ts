const KEY = "rise:lastScoutId";

export function saveLastScoutId(id: string) {
    sessionStorage.setItem(KEY, id);
}

export function loadLastScoutId(): string | null {
    return sessionStorage.getItem(KEY);
}

export function clearLastScoutId() {
    sessionStorage.removeItem(KEY);
}
