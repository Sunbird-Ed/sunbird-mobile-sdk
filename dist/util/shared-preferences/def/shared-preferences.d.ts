export interface SharedPreferences {
    getString(key: string): Promise<string | null>;
    /**
     * @Deprecated
     * */
    getStringWithoutPrefix(key: string): Promise<string>;
    putString(key: string, value: string): void;
}
