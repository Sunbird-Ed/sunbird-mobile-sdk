export class Path {
    public static ASSETS_PATH = 'file:///android_asset/www/assets';

    public static dirPathFromFilePath(filePath: string): string {
        return filePath.substring(0, filePath.lastIndexOf('/'));
    }

    public static fileNameFromFilePath(filePath: string): string {
        return filePath.substring(filePath.lastIndexOf('/') + 1);
    }
    public static getAssetPath() : string {
        return (window.device.platform.toLowerCase() === "ios" ?  cordova.file.applicationDirectory + 'www/assets': Path.ASSETS_PATH)
    }
}
