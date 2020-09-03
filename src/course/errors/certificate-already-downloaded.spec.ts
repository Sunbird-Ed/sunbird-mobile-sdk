import {CertificateAlreadyDownloaded} from './certificate-already-downloaded';

describe('CertificateAlreadyDownloaded', () => {
    let certificateAlreadyDownloaded: CertificateAlreadyDownloaded;

    beforeAll(() => {
        certificateAlreadyDownloaded = new CertificateAlreadyDownloaded('sample-message', '');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of certificateAlreadyDownloaded', () => {
        expect(certificateAlreadyDownloaded).toBeTruthy();
        expect(certificateAlreadyDownloaded.message).toBe('sample-message');
        expect(certificateAlreadyDownloaded.code).toBe('CERTIFICATE_ALREADY_DOWNLOADED');
    });
});
