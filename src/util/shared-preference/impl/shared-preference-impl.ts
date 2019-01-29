import {SharedPreference} from '../def/shared-preference';

export class SharedPreferenceImpl implements SharedPreference {
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
