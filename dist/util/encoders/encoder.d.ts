export interface Encoder<E, D> {
    encode(arg: E): D;
    decode(arg: D): E;
}
