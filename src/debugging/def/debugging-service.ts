import { Observable, Subject } from "rxjs";

export interface DebugWatcher {
    interval: any;
    observer:  any;
    debugStatus: boolean;
}

export interface DebuggingService {
    deviceId: string;
    enableDebugging(traceID?: string): Promise<Observable<boolean>>;
    disableDebugging(): Promise<Observable<boolean>>;
    isDebugOn(): boolean;
}
