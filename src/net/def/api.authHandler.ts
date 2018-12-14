export abstract class APIAuthHandler {

    /**
     * @return {Promise<string>} returns Bearer Token
     */
    abstract resetAuthToken(): Promise<string>;
}