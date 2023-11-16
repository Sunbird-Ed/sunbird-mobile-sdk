export class Path {
    public static ASSETS_PATH = 'file:///android_asset/www/assets';

    public static dirPathFromFilePath(filePath: string): string {
        return filePath.substring(0, filePath.lastIndexOf('/'));
    }

    public static fileNameFromFilePath(filePath: string): string {
        return filePath.substring(filePath.lastIndexOf('/') + 1);
    }
    public static getAssetPath() : string {
        let devicePlatform = "";
        return window['Capacitor']['Plugins'].Device.getInfo().then((val) => {
            devicePlatform = val.platform
            return (devicePlatform.toLowerCase() === "ios" ? window['Capacitor']['Plugins'].Directory.Data + 'www/assets': Path.ASSETS_PATH)
        })
    }
}
