import {GenerateInteractTelemetry} from './generate-interact-telemetry';
import { TelemetryService, ImportContentContext } from '../../..';
import { of } from 'rxjs';

describe('GenerateInteractTelemetry', () => {
    let generateInteractTelemetry: GenerateInteractTelemetry;
    const mockTelemetryService: Partial<TelemetryService> = {};

    beforeAll(() => {
        generateInteractTelemetry = new GenerateInteractTelemetry(
            mockTelemetryService as TelemetryService
        );
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('should be create a instance of generateInteractTelemetry', () => {
        expect(generateInteractTelemetry).toBeTruthy();
    });

    it('should be generate update telemetry event', (done) => {
        // arrange
        const myArray = ['value1', 'value2', 'value3'];
        const contentIdsToDeleted = new Set(myArray);
        const corr = [{
            id: 'SAMPLE_ID',
            type: 'SAMPLE_TYPE'
        }];
        const importContentContext: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'file-path',
            destinationFolder: '',
            skippedItemsIdentifier: [],
            items: [{'identifier': 'sample-id', contentType: 'Course'}],
            contentImportResponseList: [],
            correlationData: corr,
            rollUp: {},
            contentIdsToDelete: contentIdsToDeleted,
            identifier: 'Sample_identifier',
            tmpLocation: 'sample-native-url'
         };
        const subType = 'content';
        mockTelemetryService.interact = jest.fn(() => of(true));
        // act
        generateInteractTelemetry.execute(importContentContext, subType).then(() => {
            // assert
            expect(mockTelemetryService.interact).toHaveBeenCalledWith({
                pos: [],
                type: 'OTHER',
                subType: 'content',
                pageId: 'ImportContent',
                id: 'ImportContent',
                env: 'sdk',
                objId: 'sample-id',
                objType: 'Course',
                objVer: 'undefined',
                correlationData: [ { id: 'SAMPLE_ID', type: 'SAMPLE_TYPE' } ] });
            done();
        });
    });

    it('should be generate update telemetry event or identifier', (done) => {
        // arrange
        const myArray = ['value1', 'value2', 'value3'];
        const contentIdsToDeleted = new Set(myArray);
        const corr = [{
            id: 'SAMPLE_ID',
            type: 'SAMPLE_TYPE'
        }];
        const importContentContext: ImportContentContext = {
            isChildContent: true,
            ecarFilePath: 'file-path',
            destinationFolder: '',
            skippedItemsIdentifier: [],
            items: [],
            contentImportResponseList: [],
            correlationData: corr,
            rollUp: {},
            contentIdsToDelete: contentIdsToDeleted,
            identifier: 'Sample_identifier',
            tmpLocation: 'sample-native-url'
         };
        const subType = 'content';
        mockTelemetryService.interact = jest.fn(() => of(true));
        // act
        generateInteractTelemetry.execute(importContentContext, subType).then(() => {
            // assert
            expect(mockTelemetryService.interact).toHaveBeenCalledWith({
                pos: [],
                type: 'OTHER',
                subType: 'content',
                pageId: 'ImportContent',
                id: 'ImportContent',
                env: 'sdk',
                objId: 'Sample_identifier',
                objType: '',
                objVer: '',
                correlationData: [ { id: 'SAMPLE_ID', type: 'SAMPLE_TYPE' } ] });
            done();
        });
    });
});
