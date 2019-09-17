export declare enum JWTokenType {
    HS256 = "HS256"
}
export declare class JWTUtil {
    static createJWToken(subject: any, secretKey: string, tokenType?: JWTokenType): string;
    static getJWTPayload(token: string): any;
}
