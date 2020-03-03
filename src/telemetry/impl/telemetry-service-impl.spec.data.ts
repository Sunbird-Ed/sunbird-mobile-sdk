import {SdkConfig} from '../../sdk-config';

export const mockSdkConfigWithtelemetryServiceConfig: Partial<SdkConfig> = {
    telemetryConfig: {
      apiPath: 'sample_api_path',
      telemetrySyncBandwidth: 1,
      telemetrySyncThreshold: 1,
      telemetryLogMinAllowedOffset: 1
    }
  };
