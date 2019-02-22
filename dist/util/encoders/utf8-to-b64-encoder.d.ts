import { Encoder } from './encoder';
export declare class Utf8ToB64Encoder implements Encoder<string, string> {
    decode(arg: string): string;
    encode(arg: string): string;
}
