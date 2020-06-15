import {HttpRequestType, HttpSerializer, Request} from '../..';
import {NetworkQueueRequest, NetworkQueueType} from '..';
import {TelemetrySyncHandler} from '../../../telemetry/handler/telemetry-sync-handler';
import {SdkConfig} from '../../../sdk-config';
import {UpdateContentStateApiHandler} from '../../../course/handlers/update-content-state-api-handler';

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
        .withBearerToken(true)
        .build();
    } else {
      body = data;
      apiRequest = new Request.Builder()
        .withType(HttpRequestType.PATCH)
        .withPath(this.config.courseServiceConfig.apiPath + UpdateContentStateApiHandler.UPDATE_CONTENT_STATE_ENDPOINT)
        .withBearerToken(true)
        .withUserToken(true)
        .withBody(body)
        .build();
    }

    const networkQueueRequest: NetworkQueueRequest = {
      msgId: messageId,
      data: (type === NetworkQueueType.TELEMETRY) ? data : JSON.stringify(data) ,
      networkRequest: apiRequest,
      priority: (type === NetworkQueueType.TELEMETRY) ? 2 : 1,
      itemCount: eventsCount,
      type: type,
      config: JSON.stringify({shouldPublishResult: isForceSynced}),
      ts: Date.now()
    };

    return networkQueueRequest;
  }
}
