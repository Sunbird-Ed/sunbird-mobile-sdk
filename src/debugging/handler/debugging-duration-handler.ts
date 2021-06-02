import { CsClientStorage } from "@project-sunbird/client-services/core";
import { Subscriber } from "rxjs";
import { SharedPreferences } from "../../util/shared-preferences"; 
import { DebuggingServiceImpl } from "../impl/debuggin-service-impl";

export class DebuggingDurationHandler {
    constructor(
        private sharedPreferences: SharedPreferences,
        private debuggingServiceImpl: DebuggingServiceImpl
    ) {}

    async handle(observer: Subscriber<boolean>) {
        let startTimeStamp = await this.sharedPreferences.getString('debug_started_at').toPromise();
        console.log(startTimeStamp);
        if (startTimeStamp) {
            let watch = setInterval(async () => {
                let cur = new Date().getTime();
                var diff =(cur - new Date(parseInt(startTimeStamp as string)).getTime()) / 1000;
                diff /= 60;
                console.log('diff', Math.abs(Math.round(diff)));
                if (Math.abs(Math.round(diff)) >= 10) {
                    this.sharedPreferences.putString('debug_started_at', '').toPromise();
                    this.debuggingServiceImpl.disableDebugging();
                    await this.sharedPreferences.putString(CsClientStorage.TRACE_ID,'').toPromise();
                    observer.next(false);
                    observer.complete();
                    clearInterval(watch);
                    this.debuggingServiceImpl.watcher.interval = null;
                    this.debuggingServiceImpl.watcher.observer = null;
                    this.debuggingServiceImpl.watcher.debugStatus = false;
                } else {
                    observer.next(true);
                }
            }, 1*60*1000);
            this.debuggingServiceImpl.watcher.interval = watch;
            this.debuggingServiceImpl.watcher.observer = observer;
            this.debuggingServiceImpl.watcher.debugStatus = true;
        } else {
            observer.next(false);
            observer.complete();
        }
    }
}