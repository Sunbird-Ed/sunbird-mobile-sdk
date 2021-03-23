import { ApiRequestHandler, ApiService, HttpRequestType, Request } from '../../api';
import { GetLearnerCerificateRequest } from '..';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LearnerCertificate } from '../def/get-learner-certificate-response';
import { CachedItemStore } from '../../key-value-store';
export class GetLearnerCertificateHandler implements ApiRequestHandler<GetLearnerCerificateRequest, {count: number, content: LearnerCertificate[]}> {
  private static readonly CERTIFICATE_SEARCH_ENDPOINT = '/api/certreg/v1/certs/search';
  private static readonly GET_LEARNER_CERTIFICATE_LOCAL_KEY = 'learner-certificate';
  constructor(private apiService: ApiService, private cachedItemStore: CachedItemStore) {
  }

  handle(request: GetLearnerCerificateRequest): Observable<{count: number, content: LearnerCertificate[]}> {
    return this.cachedItemStore.get(
      request.userId,
      GetLearnerCertificateHandler.GET_LEARNER_CERTIFICATE_LOCAL_KEY,
      'ttl_' + GetLearnerCertificateHandler.GET_LEARNER_CERTIFICATE_LOCAL_KEY,
      () => this.fetchFromServer(request),
    );
  }

  private fetchFromServer(request: GetLearnerCerificateRequest): Observable<{count: number, content: LearnerCertificate[]}> {
    let leanrnerRequest = {
      ...(request.size ? { size: request.size } : null),
      _source: [
        'data.badge.issuer.name',
        'pdfUrl',
        'data.issuedOn',
        'data.badge.name',
        'related.courseId',
        'related.Id'
      ],
      query: {
        bool: {
          must: [
            {
              match_phrase: {
                'recipient.id': request.userId
              }
            }
          ]
        }
      }
    };
    const searchCertificateRequest = new Request.Builder()
      .withType(HttpRequestType.POST)
      .withPath(GetLearnerCertificateHandler.CERTIFICATE_SEARCH_ENDPOINT)
      .withBearerToken(true)
      .withUserToken(true)
      .withBody({
        request: leanrnerRequest
      })
      .build();
    return this.apiService.fetch<{ result: { response: { count: number, content: LearnerCertificate[] } } }>(searchCertificateRequest)
      .pipe(
        map((response) => {
          return response.body.result.response;
        })
      );
  }
}
