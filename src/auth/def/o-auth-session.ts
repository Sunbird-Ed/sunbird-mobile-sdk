export interface OAuthSession {
    access_token: string;
    refresh_token: string;
    userToken: string;
    managed_access_token?: string;
}
