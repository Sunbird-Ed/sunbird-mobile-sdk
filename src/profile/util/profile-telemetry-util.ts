import {Profile} from '..';
import {ObjectUtil} from '../../util/object-util';

export class ProfileTelemetryUtil {
    public static getPropDiff(prevProfile: Profile, newProfile: Profile): string[] {
        return ProfileTelemetryUtil.getTruthyProps(prevProfile).reduce<string[]>((acc: string[], key) => {
            if (!ObjectUtil.equals(prevProfile[key], newProfile[key])) {
                return acc;
            }

            acc.push(key);
            return acc;
        }, []);
    }

    public static getTruthyProps(profile: Profile): string[] {
        return Object.keys(profile).filter((key) => !!profile[key]);
    }
}
