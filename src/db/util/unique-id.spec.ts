import {UniqueId} from './unique-id';

describe('UniqueId', () => {
    let uniqueId;
    beforeAll(() => {
        uniqueId = new UniqueId()
    })
    it('should generate UniqueId', () => {
        // arrange
        jest.mock('uuid/v4', () => ({
            uuidv4: () => "random_string"
        }));
        // act
        // uniqueId
        // assert
        setTimeout(() => {
            expect(uniqueId.returnUuid()).toReturn();
        }, 0);
    });
});
