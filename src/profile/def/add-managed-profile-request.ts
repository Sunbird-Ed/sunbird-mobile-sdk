export interface AddManagedProfileRequest {
    firstName: string;
    lastName?: string;
    managedBy: string;
    framework?: any;
    locationCodes?: string[];
}
