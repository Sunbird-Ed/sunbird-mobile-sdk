import {SharedPreferences} from '..';

export class SharedPreferencesImpl implements SharedPreferences {
    public async getString(key: string): Promise<string | null> {
        return localStorage.getItem(key);
    }

    /**
     * @Deprecated
     * */
    getStringWithoutPrefix(key: string): Promise<string> {
        throw new Error('Deprecated');
    }

    putString(key: string, value: string): void {
        return localStorage.setItem(key, value);
    }
}
