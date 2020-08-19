import {UniqueId} from '../../db/util/unique-id';

export class GroupSessionDeprecated {
    private readonly _gid: string;
    private readonly _sid: string;
    private readonly _createdTime: number;

    constructor(gid: string) {
        this._gid = gid;
        this._sid = UniqueId.generateUniqueId();
        this._createdTime = Date.now();
    }

    get gid(): string {
        return this._gid;
    }

    get sid(): string {
        return this._sid;
    }

    get createdTime(): number {
        return this._createdTime;
    }
}
