import {CourseCertificate} from './course';

export interface DownloadCertificateRequest {
  courseId: string;
  certificate: CourseCertificate;
}
