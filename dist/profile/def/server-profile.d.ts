export interface ServerProfile {
    userId: string;
    identifier: string;
    firstName: string;
    lastName: string;
    rootOrg: RootOrg;
    tncAcceptedVersion: string;
    tncAcceptedOn: string;
    tncLatestVersion: string;
    promptTnC: boolean;
    tncLatestVersionUrl: string;
}
export interface RootOrg {
    rootOrgId?: string;
    orgName?: string;
    slug?: string;
    hashTagId: string;
}
