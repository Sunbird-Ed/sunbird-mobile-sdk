import { OauthSession, SessionProvider } from '..';
import { StepOneCallbackType } from './o-auth-delegate';
export declare class GoogleSessionProvider implements SessionProvider {
    private paramsObj;
    constructor(paramsObj: StepOneCallbackType);
    provide(): Promise<OauthSession>;
}
