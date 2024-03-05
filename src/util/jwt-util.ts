export class JwtUtil {
    public static decodeJWT(accessToken: string): Promise<any> {
        return new Promise((resolve, reject) => {
            return sbutility.decodeJWTToken(accessToken, 
                (res) => {
                    resolve(res);
                },
                (e) => {
                    reject(e)
                })
        })
    }

    public static createJWTToken(deviceId: string, userId: string): Promise<string> {
        return new Promise((resolve, reject) => { 
            sbutility.getJWTToken(deviceId, userId, 
                (res) => {
                    resolve(res);
                },
                (e) => {
                    reject(e);
                })
        })
    }
}
