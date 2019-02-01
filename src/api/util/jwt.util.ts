import * as jwt from 'jsonwebtoken';

export enum JWTokenType {
    HS256 = 'HS256'
}

export class JWTUtil {
    public static createJWToken(subject: any, secretKey: string, tokenType: JWTokenType = JWTokenType.HS256): string {
        return jwt.sign(subject, secretKey, {algorithm: tokenType});
    }

    public static parseUserTokenFromAccessToken(accessToken: string): string {
        // TODO
        return '';
    }
}
