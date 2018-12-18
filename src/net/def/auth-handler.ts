export abstract class AuthHandler {

    /**
     * @return {Promise<string>} returns Bearer Token
     */
    abstract resetAuthToken(): Promise<string>;
}