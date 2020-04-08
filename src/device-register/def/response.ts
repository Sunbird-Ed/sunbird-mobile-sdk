export {Profile as DeviceProfileResponse} from '@project-sunbird/client-services';

export interface DeviceRegisterResponse {
    ts: string;
    result: {
        actions: Array<any>;
    };
}
