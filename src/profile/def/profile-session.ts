import {UniqueId} from '../../db/util/unique-id';

export class ProfileSession {
    readonly uid: string;
    readonly sid: string;
    readonly createdTime: number;
    managedSession?: ProfileSession;

    constructor(uid: string, managingSession?: ProfileSession) {
        this.uid = uid;
        this.sid = UniqueId.generateUniqueId();
        this.createdTime = Date.now();
        this.managedSession = managingSession;
    }
}
