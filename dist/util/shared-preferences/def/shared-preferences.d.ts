export interface SharedPreferences {
    getString(key: string): Promise<string | null>;
    putString(key: string, value: string): void;
}
