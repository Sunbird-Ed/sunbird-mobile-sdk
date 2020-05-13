export {Profile as DeviceProfileResponse} from '@project-sunbird/client-services/models';

export interface DeviceRegisterResponse {
    ts: string;
    result: {
        actions: Array<any>;
    };
}
