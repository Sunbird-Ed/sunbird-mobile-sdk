export interface AddManagedProfileRequest {
    firstName: string;
    lastName?: string;
    managedBy: string;
    framework?: any;
    profileLocation?: {
        code: string;
        type: string;
    }[];
}
