import {CourseCertificate} from './course';

export interface GetCertificateRequest {
  courseId: string;
  certificate: CourseCertificate;
}
