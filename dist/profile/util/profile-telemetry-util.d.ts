import { Profile } from '..';
export declare class ProfileTelemetryUtil {
    static getPropDiff(prevProfile: Profile, newProfile: Profile): string[];
    static getTruthyProps(profile: Profile): string[];
}
