export declare class ProfileSession {
    private readonly _uid;
    private readonly _sid;
    private readonly _createdTime;
    constructor(uid: string);
    readonly uid: string;
    readonly sid: string;
    readonly createdTime: number;
}
