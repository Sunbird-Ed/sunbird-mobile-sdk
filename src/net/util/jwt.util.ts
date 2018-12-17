export class JWTokenType {
    public static HS256 = new JWTokenType("HS256", "HmacSHA256");

    private readonly _algorithmName: string;
    private readonly _tokenType: string;

    get algorithmName(): string {
        return this._algorithmName;
    }

    get tokenType(): string {
        return this._tokenType;
    }

    private constructor(algorithmName: string, tokenType: string) {
        this._algorithmName = algorithmName;
        this._tokenType = tokenType;
    }
}

export class JWTUtil {
    public static createJWToken(subject: string, secretKey, tokenType: JWTokenType): string {
        // TODO
        return '';
    }
}