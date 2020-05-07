import {searchResult} from './content-group-generator.spec.data';
import {ContentGroupGenerator} from './content-group-generator';
import {ContentGroupingCriteria, ContentSearchCriteria, SearchType, SortOrder,} from '..';

describe('ContentGroupGenerator', () => {
    it('should be able to generate contents grouped by its attributes', () => {
        // arrange
        const searchRequest: ContentSearchCriteria = {
            searchType: SearchType.SEARCH,
            grade: ['Class 2'],
            medium: ['English'],
            board: ['State (Andhra Pradesh)'],
            mode: 'hard',
            facets: ['subject'],
            contentTypes: ['TextBook', 'Course'],
            sortCriteria: [
                {
                    sortAttribute: 'name',
                    sortOrder: SortOrder.ASC,
                },
            ],
            limit: 100,
            offset: 0,
        };

        const groupingRequest: ContentGroupingCriteria[] = [
            {
                groupAttribute: 'contentType',
                values: ['TextBook', 'Course'],
                sortCriteria: {
                    sortAttribute: 'name',
                    sortOrder: SortOrder.ASC,
                },
            },
            {
                groupAttribute: 'medium',
                values: ['English', 'Urdu'],
                sortCriteria: {
                    sortAttribute: 'name',
                    sortOrder: SortOrder.ASC,
                },
            },
            {
                groupAttribute: 'gradeLevel',
                values: ['Class 2', 'Class 1', 'Class 4'],
                sortCriteria: {
                    sortAttribute: 'name',
                    sortOrder: SortOrder.ASC,
                },
            },
            {
                groupAttribute: 'subject',
                values: [],
                sortCriteria: {
                    sortAttribute: 'name',
                    sortOrder: SortOrder.ASC,
                },
            },
        ];
        // assert
        expect(
            ContentGroupGenerator.generate(
                searchResult.result.content as any,
                groupingRequest,
                searchRequest.sortCriteria![0]
            )
        ).toMatchSnapshot();
    });
});
