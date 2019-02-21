import {Encoder} from './encoder';

export class Utf8ToB64Encoder implements Encoder<string, string> {
    decode(arg: string): string {
        return decodeURIComponent(escape(window.atob(arg)));
    }

    encode(arg: string): string {
        return window.btoa(unescape(encodeURIComponent(arg)));
    }
}
