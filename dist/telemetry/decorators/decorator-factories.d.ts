export declare const afterMethodFactory: (descriptor: PropertyDescriptor, cb: () => void) => PropertyDescriptor;
export declare const beforeMethodFactory: (descriptor: PropertyDescriptor, cb: () => void) => PropertyDescriptor;
export declare const afterMethodThrowsFactory: (descriptor: PropertyDescriptor, cb: (e: any) => void) => PropertyDescriptor;
export declare const afterMethodResolvesFactory: (descriptor: PropertyDescriptor, cb: () => void) => PropertyDescriptor;
export declare const afterMethodRejectsFactory: (descriptor: PropertyDescriptor, cb: () => void) => PropertyDescriptor;
