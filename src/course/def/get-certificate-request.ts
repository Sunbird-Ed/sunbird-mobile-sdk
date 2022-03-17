import { CertificateType } from '@project-sunbird/client-services/services/certificate';
import {CourseCertificate} from './course';

export { CertificateType } from '@project-sunbird/client-services/services/certificate';

export interface GetCertificateRequest {
  courseId: string;
  certificate: CourseCertificate;
}
