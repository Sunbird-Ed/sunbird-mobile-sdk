import {ApiRequestHandler, ApiService, HttpRequestType, Request} from '../../api';
import {CourseServiceImpl, GetLearnerCerificateRequest} from '..';
import {Observable} from 'rxjs';
import {map} from 'rxjs/operators';
import {LearnerCertificate} from '../def/get-learner-certificate-response';

export class GetLearnerCertificateHandler implements ApiRequestHandler<GetLearnerCerificateRequest, LearnerCertificate[]> {
  private  readonly CERTIFICATE_SEARCH_ENDPOINT = '/api/certreg/v1/certs/search';
  constructor(private apiService: ApiService) {
  }

  handle(request: GetLearnerCerificateRequest): Observable<LearnerCertificate[]> {
    const searchCertificateRequest = new Request.Builder()
      .withType(HttpRequestType.POST)
      .withPath(this.CERTIFICATE_SEARCH_ENDPOINT)
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
