import {HttpRequestType, HttpSerializer, Request} from '../..';
import {NetworkQueueRequest, NetworkQueueType} from '..';
import {TelemetrySyncHandler} from '../../../telemetry/handler/telemetry-sync-handler';
import {SdkConfig} from '../../../sdk-config';

export class NetworkRequestHandler {

  constructor(private config: SdkConfig) {
  }

  public generateNetworkQueueRequest(type, data, messageId, eventsCount, isForceSynced): NetworkQueueRequest {
    let body;
    let apiRequest: Request;
    if (type === NetworkQueueType.TELEMETRY) {
      const gzippedCharData = data.split('').map((c) => {
        return c.charCodeAt(0);
      });
      body = new Uint8Array(gzippedCharData);
      apiRequest = new Request.Builder()
        .withSerializer(HttpSerializer.RAW)
        .withHost(this.config.telemetryConfig.host!)
        .withType(HttpRequestType.POST)
        .withPath(this.config.telemetryConfig.apiPath + TelemetrySyncHandler.TELEMETRY_ENDPOINT)
        .withHeaders({
          'Content-Type': 'application/json',
          'Content-Encoding': 'gzip'
        })
        .withBody(body)
        .withApiToken(true)
        .build();
    } else {
      body = data;
    }

    const networkQueueRequest: NetworkQueueRequest = {
      msgId: messageId!,
      data: data,
      networkRequest: apiRequest!,
      priority: 1,
      itemCount: eventsCount,
      type: NetworkQueueType.TELEMETRY,
      config: JSON.stringify({shouldPublishResult: isForceSynced}),
      ts: Date.now()
    };

    return networkQueueRequest;
  }
}
