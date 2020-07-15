import {searchResult} from './content-group-generator.spec.data';
import {ContentsGroupGenerator} from './contents-group-generator';
import {SortOrder} from '..';

describe('ContentGroupGenerator', () => {
    it('should be able to generate contents grouped by its attributes', () => {
        // assert
        expect(
            ContentsGroupGenerator.generate(
                searchResult.result.content as any,
                {
                    groupBy: 'subject',
                    combination: {
                        medium: ['invalid_medium', 'english', 'hindi'],
                        gradeLevel: ['class 2', 'invalid']
                    },
                    sortCriteria: {
                        sortAttribute: 'name',
                        sortOrder: SortOrder.ASC,
                    }
                }
            )
        ).toMatchSnapshot();
    });
});
