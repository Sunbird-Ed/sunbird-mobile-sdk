import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {Batch, CourseServiceConfig, UpdateContentStateAPIRequest} from '..';
import {Observable, Observer} from 'rxjs';
import {map, mergeMap} from 'rxjs/operators';
import {NetworkQueue, NetworkQueueEntry, NetworkQueueType} from '../../api/network-queue';
import {NetworkRequestHandler} from '../../api/network-queue/handlers/network-request-handler';
import {SdkConfig} from '../../sdk-config';
import {UniqueId} from '../../db/util/unique-id';
import {ProcessingError} from '../../auth/errors/processing-error';

export class UpdateContentStateApiHandler implements ApiRequestHandler<UpdateContentStateAPIRequest, { [key: string]: any }> {
  public static readonly UPDATE_CONTENT_STATE_ENDPOINT = '/content/state/update';


  constructor(private networkQueue: NetworkQueue,
              private sdkConfig: SdkConfig) {
  }

  public handle(updateContentStateAPIRequest: UpdateContentStateAPIRequest): Observable<{ [key: string]: any }> {
    return this.networkQueue.enqueue(new NetworkRequestHandler(this.sdkConfig).generateNetworkQueueRequest(
      NetworkQueueType.COURSE_PROGRESS,
      {request: updateContentStateAPIRequest},
      UniqueId.generateUniqueId(), updateContentStateAPIRequest.contents ? updateContentStateAPIRequest.contents.length : 0,
      true),
      true).pipe(
      mergeMap(() => {
        return new Observable((observer: Observer<{ [key: string]: any }>) => {
          sbsync.onSyncSucces(async (response) => {
            const courseProgressResponse = response.courseProgressResponse;
            const error = response.course_progress_error;
            if (courseProgressResponse) {
              observer.next(courseProgressResponse);
            } else if (error) {
              observer.error(error);
            }
            observer.complete();
          }, async (error) => {
            observer.error(error);
          });
        });
      }));
  }

}
