import { Subscriber } from "rxjs";
import { SharedPreferences } from "../../util/shared-preferences";
import { DebuggingServiceImpl } from "../impl/debuggin-service-impl";
export declare class DebuggingDurationHandler {
    private sharedPreferences;
    private debuggingServiceImpl;
    constructor(sharedPreferences: SharedPreferences, debuggingServiceImpl: DebuggingServiceImpl);
    handle(observer: Subscriber<boolean>): Promise<void>;
}
