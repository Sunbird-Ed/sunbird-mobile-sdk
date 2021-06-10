export declare class ProfileSession {
    readonly uid: string;
    readonly sid: string;
    readonly createdTime: number;
    managedSession?: ProfileSession;
    constructor(uid: string, managingSession?: ProfileSession);
}
