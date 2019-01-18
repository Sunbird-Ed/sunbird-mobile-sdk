export const afterMethodFactory: (descriptor: PropertyDescriptor, cb: () => void) => PropertyDescriptor =
    (descriptor: PropertyDescriptor, cb: () => void) => {
        const originalMethod = descriptor.value;
        descriptor.value = function () {
            originalMethod.apply(this, arguments);

            cb();
        };
        return descriptor;
    };

export const beforeMethodFactory: (descriptor: PropertyDescriptor, cb: () => void) => PropertyDescriptor =
    (descriptor: PropertyDescriptor, cb: () => void) => {
        const originalMethod = descriptor.value;
        descriptor.value = function () {
            cb();
            originalMethod.apply(this, arguments);
        };
        return descriptor;
    };

export const afterMethodThrowsFactory: (descriptor: PropertyDescriptor, cb: (e: any) => void) => PropertyDescriptor =
    (descriptor: PropertyDescriptor, cb: (e: any) => void) => {
        const originalMethod = descriptor.value;
        descriptor.value = function () {
            try {
                originalMethod.apply(this, arguments);
            } catch (e) {
                cb(e);
                throw e;
            }
        };
        return descriptor;
    };

export const afterMethodResolvesFactory: (descriptor: PropertyDescriptor, cb: () => void) => PropertyDescriptor =
    (descriptor: PropertyDescriptor, cb: () => void) => {
        const originalMethod = descriptor.value;
        descriptor.value = function () {
            originalMethod.apply(this, arguments).then((result) => {
                cb();
                return Promise.resolve(result);
            });
        };
        return descriptor;
    };

export const afterMethodRejectsFactory: (descriptor: PropertyDescriptor, cb: () => void) => PropertyDescriptor =
    (descriptor: PropertyDescriptor, cb: () => void) => {
        const originalMethod = descriptor.value;
        descriptor.value = function () {
            originalMethod.apply(this, arguments).catch((result) => {
                cb();
                return Promise.reject(result);
            });
        };
        return descriptor;
    };
