import * as uuidv4 from 'uuid/v4';

export class UniqueId {

    public static generateUniqueId() {
        return uuidv4();
    }
}
