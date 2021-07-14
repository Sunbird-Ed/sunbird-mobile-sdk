import {SdkConfig} from '../../sdk-config';
import {ApiConfig} from '../../api';

export const mockSdkConfigWithCourseConfig: Partial<SdkConfig> = {
    apiConfig: {
        host: 'SAMPLE_HOST',
    } as Partial<ApiConfig> as ApiConfig,
    courseServiceConfig: {
        apiPath: 'SAMPLE_API_PATH'
    }
};
