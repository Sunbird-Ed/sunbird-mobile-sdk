// @ts-ignore
declare var buildconfigreader: {
    getBuildConfigValue: (packageName: string, property: string, success:
        (callbackUrl: string) => void, error: (error: string) => void) => void;

    getBuildConfigValues: (packageName: string, success:
        (callbackUrl: string) => void, error: (error: string) => void) => void;

    rm: (directoryPath: string, directoryToBeSkipped: string, success:
        (callbackUrl: boolean) => void, error: (error: boolean) => void) => void;

    openPlayStore: (appId: string, success: (callbackUrl) => void, error: (error) => void) => void;

    getDeviceAPILevel: (success, error) => void;

    checkAppAvailability: (packageName: string, success, error) => void;

    getDownloadDirectoryPath: (success, error) => void;

    exportApk: (onSuccess, onError) => void;

    getUtmInfo: (onSuccess, onError) => void;

    clearUtmInfo: (onSuccess, onError) => void;

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
};
