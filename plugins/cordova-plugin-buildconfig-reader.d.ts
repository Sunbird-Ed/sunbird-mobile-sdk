// @ts-ignore
declare var buildconfigreader: {
    getBuildConfigValue: (packageName: string, property: string, success:
        (callbackUrl: string) => void, error: (error: string) => void) => void;

    getBuildConfigValues: (packageName: string, success:
        (callbackUrl: string) => void, error: (error: string) => void) => void;

    rm: (directoryPath: string, direcoryToBeSkipped: string, success:
        (callbackUrl: boolean) => void, error: (error: boolean) => void) => void;

    createDirectories: (parentDirectoryPath: string, listOfFolder: string[], success:
        (callbackUrl: any) => void, error: (error: string) => void) => void;

    writeFile: (fileMapList: any[], success:
        (callbackUrl: void) => void, error: (error: string) => void) => void;

    getMetaData: (fileMapList: any[], success:
        (callbackUrl: any) => void, error: (error: string) => void) => void;

};
