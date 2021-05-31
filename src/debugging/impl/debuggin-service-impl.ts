import { inject, injectable } from "inversify";
import { Observable, of } from "rxjs";
import { InjectionTokens } from "../../injection-tokens";
import { JWTokenType, JWTUtil } from "../../api";
import { DebuggingService } from "../def/debugging-service";
import { SharedPreferences } from '../../util/shared-preferences';
import { DebuggingDurationHandler } from "../handler/debugging-duration-handler";
import { ProfileService } from "../../profile";
import { CsClientStorage } from "@project-sunbird/client-services/core";

@injectable()
export class DebuggingServiceImpl implements DebuggingService {

    private _userId: string;
    private _deviceId: string;
    watcher: any;

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
    ) {}

    enableDebugging(): Observable<boolean> {
        /* TODO
         * generateJWT token and set it
         * set startTimestamp store it in preferences
         * start a check every 5min to check expiry
         * if expired then reset the destory the JWT token
         */
        return new Observable<boolean>(observer => {
            this.profileService.getActiveProfileSession().toPromise().then(async (profile) => {
                if (profile && profile.uid) {
                    this._userId = profile.uid;
                    let _jwt = JWTUtil.createJWToken(this._deviceId, this.userId, JWTokenType.HS256);
                    await this.sharedPreferences.putString(CsClientStorage.TRACE_ID, _jwt).toPromise();
                    console.log('JWT', _jwt);
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
        if (this.watcher) {
            clearTimeout(this.watcher);
            this.watcher = null;
            this.sharedPreferences.putString('debug_started_at', '').toPromise();
            this.sharedPreferences.putString(CsClientStorage.TRACE_ID, '').toPromise();
            return of(true);
        }
        return of(false);
    }

    isDebugOn(): boolean {
        if (this.watcher) {
            return true;
        } else {
            return false;
        }
    }

}