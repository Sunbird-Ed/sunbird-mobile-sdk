import {UniqueId} from '../../../native/db/util/unique-id';

export class ProfileSession {
    private readonly _uid: string;
    private readonly _sid: string;
    private readonly _createdTime: number;

    constructor(uid: string) {
        this._uid = uid;
        this._sid = UniqueId.generateUniqueId();
        this._createdTime = Date.now();
    }

    get uid(): string {
        return this._uid;
    }

    get sid(): string {
        return this._sid;
    }

    get createdTime(): number {
        return this._createdTime;
    }
}
