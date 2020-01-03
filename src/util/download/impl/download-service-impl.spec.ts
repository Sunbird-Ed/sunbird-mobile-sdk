import { DownloadServiceImpl } from './download-service-impl';
import { SharedPreferences, EventsBusService, DownloadRequest, DownloadCancelRequest } from '../../..';
import { of, BehaviorSubject, Subject } from 'rxjs';
import { take, sample } from 'rxjs/operators';
import { SharedPreferencesSetCollectionImpl } from '../../shared-preferences/impl/shared-preferences-set-collection-impl';
import { SharedPreferencesSetCollection } from '../../shared-preferences/def/shared-preferences-set-collection';

const mockSharedPreferencesSetCollection =
    {
        identifier: 'SAMPLE_ID',
        downloadUrl: 'http://sample-url/',
        mimeType: 'SAMPLE_MIME_TYPE',
        destinationFolder: 'DESTINATION_FOLDER',
        filename: 'ASSESSMENT'
    } as Partial<SharedPreferencesSetCollection<DownloadRequest>> as SharedPreferencesSetCollection<DownloadRequest>;
jest.mock('', () => {
    return mockSharedPreferencesSetCollection;
});

describe('DownloadServiceImpl', () => {
    let downloadServiceImpl: DownloadServiceImpl;
    const mockEventsBusService: Partial<EventsBusService> = {};
    const mockSharedPreferences: Partial<SharedPreferences> = {
    };

    beforeAll(() => {
        downloadServiceImpl = new DownloadServiceImpl(
            mockEventsBusService as EventsBusService,
            mockSharedPreferences as SharedPreferences
        );
    });

    const downloadRequestSet = new Set();
   

    mockSharedPreferencesSetCollection.asSet = jest.fn(() => of(downloadRequestSet.add({
        identifier: 'SAMPLE_ID',
        downloadUrl: 'http://sample-url/',
        mimeType: 'SAMPLE_MIME_TYPE',
        destinationFolder: 'DESTINATION_FOLDER',
        filename: 'ASSESSMENT'
    })));

    beforeEach(() => {
        jest.clearAllMocks();
     //   (SharedPreferencesSetCollectionImpl as any as jest.Mock<SharedPreferencesSetCollectionImpl<DownloadRequest>>).mockClear();
    });


    it('should create a instance of downloadServiceImpl', () => {
        const request: DownloadRequest = {
            identifier: 'SAMPLE_ID',
            downloadUrl: 'http://sample-url/',
            mimeType: 'SAMPLE_MIME_TYPE',
            destinationFolder: 'DESTINATION_FOLDER',
            filename: 'ASSESSMENT'
        };
        const subject = new BehaviorSubject(request);
        expect(subject).toBeInstanceOf(Subject);
        expect(downloadServiceImpl).toBeTruthy();
    });

    it('should check current download request by invoked onInit()', (done) => {
        // arrange
        mockSharedPreferences.getString = jest.fn(() => of(undefined));
        // act
        downloadServiceImpl.onInit().subscribe(() => {
            // assert
            expect(mockSharedPreferences.getString).toHaveBeenCalledWith('to_download_list');
            done();
        });
    });

    it('should be add all download requested file in a list by invoked download()', (done) => {
        // arrange
        const request: DownloadRequest[] = [{
            identifier: 'SAMPLE_ID',
            downloadUrl: 'http://sample-url/',
            mimeType: 'SAMPLE_MIME_TYPE',
            destinationFolder: 'DESTINATION_FOLDER',
            filename: 'ASSESSMENT'
        }];
        mockSharedPreferences.putString = jest.fn(() => of(undefined));
        // act
        downloadServiceImpl.download(request).subscribe(() => {
            // act
            expect(mockSharedPreferences.putString).toHaveBeenCalledWith('to_download_list', expect.any(String));
            done();
        });
    });

    it('should cancelled dowload request by invoked cancel()', (done) => {
        // arrange
        const downloadRequest: DownloadRequest = {
            identifier: 'SAMPLE_ID',
            downloadUrl: 'http://sample-url/',
            mimeType: 'SAMPLE_MIME_TYPE',
            destinationFolder: 'DESTINATION_FOLDER',
            filename: 'ASSESSMENT'
        };
        const subject$ = new BehaviorSubject(downloadRequest);
        // expect(subject).toBeInstanceOf(downloadRequest);
        const request: DownloadCancelRequest = {
            identifier: 'SAMPLE_ID'
        };
        const currentDownloadRequest: DownloadRequest = {
            identifier: 'SAMPLE_ID',
            downloadUrl: 'http://sample-url/',
            mimeType: 'SAMPLE_MIME_TYPE',
            destinationFolder: 'DESTINATION_FOLDER',
            filename: 'ASSESSMENT'
        };
        const generateTelemetry = true;
        mockSharedPreferences.getString = jest.fn(() => of(undefined));
        // act
        downloadServiceImpl.cancel(request, generateTelemetry).subscribe((res) => {
            // assert
            console.log('//////', res)
            subject$.pipe(take(1))
                .subscribe(
                    result => expect(result).toBe(subject$)
                );
            done();
        });
    });

    it('', () => {
        // arrange
        // act
        //  downloadServiceImpl.cancelAll();
        // assert
    });
});

