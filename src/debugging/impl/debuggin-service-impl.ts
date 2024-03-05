import { inject, injectable } from "inversify";
import { Observable, of } from "rxjs";
import { InjectionTokens } from "../../injection-tokens";
import { DebuggingService, DebugWatcher } from "../def/debugging-service";
import { SharedPreferences } from '../../util/shared-preferences';
import { DebuggingDurationHandler } from "../handler/debugging-duration-handler";
import { ProfileService } from "../../profile";
import { CsClientStorage } from "@project-sunbird/client-services/core";
import { JwtUtil } from "../../util/jwt-util";

@injectable()
export class DebuggingServiceImpl implements DebuggingService {

    private _userId: string;
    private _deviceId: string;
    public watcher: DebugWatcher;
    set userId(userId) {
        this._userId = userId;
    }

    get userId() {
        return this._userId;
    }

    set deviceId(deviceId) {
        this._deviceId = deviceId;
    }

    get deviceId() {
        return this._deviceId;
    }

    constructor(
        @inject(InjectionTokens.SHARED_PREFERENCES) private sharedPreferences: SharedPreferences,
        @inject(InjectionTokens.PROFILE_SERVICE) private profileService: ProfileService
    ) {
        this.watcher = {
            interval: null,
            observer: null,
            debugStatus: false
        };
    }

    enableDebugging(traceID?: string): Observable<boolean> {
        /* TODO
         * generateJWT token and set it
         * set startTimestamp store it in preferences
         * start a check every 5min to check expiry
         * if expired then reset the destory the JWT token
         */
        return new Observable<boolean>(observer => {
            this.profileService.getActiveProfileSession().toPromise().then(async (profile) => {
                if (profile?.uid) {
                    this._userId = profile.uid;
                    const _jwt = await JwtUtil.createJWTToken(this._deviceId, this.userId)
                    if (traceID) {
                        await this.sharedPreferences.putString(CsClientStorage.TRACE_ID, traceID).toPromise();
                    } else {
                        await this.sharedPreferences.putString(CsClientStorage.TRACE_ID, _jwt).toPromise();
                    }
                    new DebuggingDurationHandler(
                        this.sharedPreferences,
                        this
                    ).handle(observer);
                    console.log('Watcher Value:', this.watcher);
                }
            });
        });
    }

    disableDebugging(): Observable<boolean> {
        if (this.watcher.debugStatus) {
            clearTimeout(this.watcher.interval);
            this.watcher.observer.complete();
            this.watcher = {
                interval: null,
                observer: null,
                debugStatus: false
            };
            this.sharedPreferences.putString('debug_started_at', '').toPromise();
            this.sharedPreferences.putString(CsClientStorage.TRACE_ID, '').toPromise();
            return of(true);
        }
        return of(false);
    }

    isDebugOn(): boolean {
        if (this.watcher.debugStatus) {
            return true;
        } else {
            return false;
        }
    }

}