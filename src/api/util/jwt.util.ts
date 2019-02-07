import * as jwt from 'jsonwebtoken';

export enum JWTokenType {
    HS256 = 'HS256'
}

export class JWTUtil {
    public static createJWToken(subject: any, secretKey: string, tokenType: JWTokenType = JWTokenType.HS256): string {
        return jwt.sign(subject, secretKey, {algorithm: tokenType});
    }

    public static parseUserTokenFromAccessToken(accessToken: string): string {
        let uid = accessToken.substring(accessToken.indexOf('.') + 1, accessToken.lastIndexOf('.'));
        uid = decodeURIComponent(escape(atob(uid)));
        return JSON.parse(uid).sub;
    }
}
