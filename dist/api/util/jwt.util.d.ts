export declare enum JWTokenType {
    HS256 = "HS256"
}
export declare class JWTUtil {
    static createJWToken(subject: string, secretKey: any, tokenType: JWTokenType): string;
    static parseUserTokenFromAccessToken(accessToken: string): string;
}
