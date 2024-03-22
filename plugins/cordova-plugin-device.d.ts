export declare type OperatingSystem = 'ios' | 'android' | 'windows' | 'mac' | 'unknown';
export interface DeviceId {
    identifier: string;
}
export interface DeviceInfo {
    name?: string;
    model: string;
    platform: 'ios' | 'android' | 'web';
    operatingSystem: OperatingSystem;
    osVersion: string;
    iOSVersion?: number;
    androidSDKVersion?: number;
    manufacturer: string;
    isVirtual: boolean;
    memUsed?: number;
    diskFree?: number;
    diskTotal?: number;
    realDiskFree?: number;
    realDiskTotal?: number;
    webViewVersion: string;
}
export interface BatteryInfo {
    batteryLevel?: number;
    isCharging?: boolean;
}
export interface GetLanguageCodeResult {
    value: string;
}
export interface LanguageTag {
    value: string;
}
interface Capacitor {
    Plugins: {
        Device: {
            getId(): Promise<DeviceId>;
            getInfo(): Promise<DeviceInfo>;
            getBatteryInfo(): Promise<BatteryInfo>;
            getLanguageCode(): Promise<GetLanguageCodeResult>;
            getLanguageTag(): Promise<LanguageTag>;
        }
    }
}
export declare type DeviceBatteryInfo = BatteryInfo;
export declare type DeviceLanguageCodeResult = GetLanguageCodeResult;
