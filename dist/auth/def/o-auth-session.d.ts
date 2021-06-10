export interface OAuthSession {
    access_token: string;
    refresh_token: string;
    userToken: string;
    accessTokenExpiresOn?: number;
    managed_access_token?: string;
}
