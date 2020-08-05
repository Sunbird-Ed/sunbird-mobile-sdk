import {NoCertificateFound} from './no-certificate-found';

describe('NoCertificateFound', () => {
    let noCertificateFound: NoCertificateFound;

    beforeAll(() => {
        noCertificateFound = new NoCertificateFound('sample-message');
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should create a instance of NoCertificateFound', () => {
        expect(noCertificateFound).toBeTruthy();
        expect(noCertificateFound.message).toBe('sample-message');
        expect(noCertificateFound.code).toBe('NO_CERTIFICATE_FOUND');
    });
});
