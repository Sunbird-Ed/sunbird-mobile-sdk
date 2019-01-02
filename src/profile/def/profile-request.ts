export class ProfileRequest {
    readonly local: boolean;
    readonly server: boolean;
    readonly groupId: string;

    private constructor(local: boolean, server: boolean, groupId: string) {
        this.local = local;
        this.server = server;
        this.groupId = groupId;
    }

    public static buildLocal(groupId: string) {
        return new ProfileRequest(true, false, groupId);
    }

    public static buildServer(groupId: string) {
        return new ProfileRequest(false, true, groupId);
    }
}
