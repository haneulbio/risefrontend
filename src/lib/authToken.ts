let accessToken: string | null = null;
let refreshToken: string | null = null;

export function setTokens(a: string, r: string) {
    accessToken = a;
    refreshToken = r;
}

export function clearTokens() {
    accessToken = null;
    refreshToken = null;
}

export function getAccessToken() {
    return accessToken;
}

export function getRefreshToken() {
    return refreshToken;
}
