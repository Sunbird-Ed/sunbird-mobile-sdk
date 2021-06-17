export class Path {
    // public static ASSETS_PATH = cordova.file.applicationDirectory + 'www/assets';

    public static dirPathFromFilePath(filePath: string): string {
        return filePath.substring(0, filePath.lastIndexOf('/'));
    }

    public static fileNameFromFilePath(filePath: string): string {
        return filePath.substring(filePath.lastIndexOf('/') + 1);
    }
    public static getAssetPath() : string {
        return cordova.file.applicationDirectory + 'www/assets'
    }
}
