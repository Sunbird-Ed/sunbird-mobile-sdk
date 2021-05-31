import { Observable } from "rxjs";

export interface DebuggingService {
    deviceId: string;
    enableDebugging(): Observable<boolean>;
    disableDebugging(): Observable<boolean>;
    isDebugOn(): boolean;
}