export class ObjectMapper {
    public static map(source: any, map: { [p: string]: string }) {
        const result = {};

        for (const key in map) {
            if (map.hasOwnProperty(key)) {
                result[key] = source[map[key]];
            }
        }

        return result;
    }
}

export class StorageMiddleware {
    public static toDb(obj: any): any {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop) && typeof obj[prop] === 'object') {
                obj[prop] = JSON.stringify(obj[prop]);
            }
        }

        return obj;
    }

    public static fromDb(obj: any): any {
        for (const prop in obj) {
            if (obj.hasOwnProperty(prop) && typeof obj[prop] === 'string') {
                try {
                    obj[prop] = JSON.parse(obj[prop]);
                } catch (e) {
                }
            }
        }
        return obj;
    }
}
