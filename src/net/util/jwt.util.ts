import * as KJUR from 'jsrsasign';


export enum JWTokenType {
    HS256 = 'HS256'
}

export class JWTUtil {
    public static createJWToken(subject: string, secretKey, tokenType: JWTokenType): string {
        const header = {alg: tokenType, typ: 'JWT'};
        return KJUR.jws.JWS.sign(tokenType, header, subject, secretKey);
    }
}