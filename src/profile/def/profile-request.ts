export class ProfileRequest {
    readonly local: boolean;
    readonly server: boolean;
    readonly groupId: string;

    constructor(local: boolean, server: boolean, groupId: string) {
        this.local = local;
        this.server = server;
        this.groupId = groupId;
    }
}
