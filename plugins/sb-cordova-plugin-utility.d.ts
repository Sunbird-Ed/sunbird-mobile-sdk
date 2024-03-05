// @ts-ignore
declare var sbutility: {
    getBuildConfigValue: (packageName: string, property: string, success:
        (callbackUrl: string) => void, error: (error: string) => void) => void;

    getBuildConfigValues: (packageName: string, success:
        (callbackUrl: string) => void, error: (error: string) => void) => void;

    rm: (directoryPath: string, direcoryToBeSkipped: string, success:
        (callbackUrl: boolean) => void, error: (error: boolean) => void) => void;

    copyDirectory: (sourceDirectory: string, destinationDirectory: string,
                    onSuccess: () => void, onError: (error: any) => void) => void;

    renameDirectory: (sourceDirectory: string, toDirectoryName: string,
                      onSuccess: () => void, onError: (error: any) => void) => void;

    getFreeUsableSpace: (directory: string, success:
        (callbackUrl: string) => void, error: (error: string) => void) => void;

    canWrite: (directory: string, success:
        (callbackUrl: string) => void, error: (error: string) => void) => void;

    createDirectories: (parentDirectoryPath: string, listOfFolder: string[], success:
        (callbackUrl: any) => void, error: (error: string) => void) => void;

    writeFile: (fileMapList: any[], success:
        (callbackUrl: void) => void, error: (error: string) => void) => void;

    getMetaData: (fileMapList: any[], success:
        (callbackUrl: any) => void, error: (error: string) => void) => void;

    getDeviceSpec: (callback: (deviceSpec: any) => void) => void;

    getAvailableInternalMemorySize: (success:
                                         (callbackUrl: string) => void, error: (error: string) => void) => void;

    getStorageVolumes: (success: (storageVolume: {
        availableSize: number;
        totalSize: number;
        state: string;
        path: string;
        contentStoragePath: string;
        isRemovable: boolean;
    }[]) => void, error: (error: any) => void) => void;

    readFromAssets: (fileName: string, success:
        (callbackUrl: string) => void, error: (error: any) => void) => void;

    copyFile: (sourceDirectory: string, destinationDirectory: string, fileName: string,
               onSuccess: () => void, onError: (error: any) => void) => void;

    getUtmInfo: (success:
        (callbackUrl: any) => void, error: (error: string) => void) => void;

    clearUtmInfo: (success:
        (callbackUrl: any) => void, error: (error: string) => void) => void;

    getJWTToken: (key, secret, 
        success:(callbackUrl: any) => void, error: (error: string) => void) => string;
        
    decodeJWTToken: (token, 
        success:(callbackUrl: any) => void, error: (error: string) => void) => string;
};
