import { ApiRequestHandler, ApiService, HttpRequestType, Request } from '../../api';
import { GetLearnerCerificateRequest } from '..';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { LearnerCertificate } from '../def/get-learner-certificate-response';
import { CachedItemStore } from '../../key-value-store';
export class GetLearnerCertificateHandler implements ApiRequestHandler<GetLearnerCerificateRequest, LearnerCertificate[]> {
  private static readonly CERTIFICATE_SEARCH_ENDPOINT = '/api/certreg/v1/certs/search';
  private static readonly GET_LEARNER_CERTIFICATE_LOCAL_KEY = 'learner-certificate';
  constructor(private apiService: ApiService, private cachedItemStore: CachedItemStore) {
  }

  handle(request: GetLearnerCerificateRequest): Observable<LearnerCertificate[]> {
    return this.cachedItemStore.get(
      request.userId,
      GetLearnerCertificateHandler.GET_LEARNER_CERTIFICATE_LOCAL_KEY,
      'ttl_' + GetLearnerCertificateHandler.GET_LEARNER_CERTIFICATE_LOCAL_KEY,
      () => this.fetchFromServer(request),
    );
  }

  private fetchFromServer(request: GetLearnerCerificateRequest): Observable<LearnerCertificate[]> {
    const searchCertificateRequest = new Request.Builder()
      .withType(HttpRequestType.POST)
      .withPath(GetLearnerCertificateHandler.CERTIFICATE_SEARCH_ENDPOINT)
      .withBearerToken(true)
      .withUserToken(true)
      .withBody({
        request: {
          size: 200,
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
        }
      })
      .build();
    return this.apiService.fetch<{ result: { response: { content: LearnerCertificate[] } } }>(searchCertificateRequest)
      .pipe(
        map((response) => {
          return response.body.result.response.content;
        })
      );
  }
}
