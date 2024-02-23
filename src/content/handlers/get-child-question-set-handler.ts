import { StorageService } from '../../storage/def/storage-service';
import { FileService } from '../../util/file/def/file-service';
import { DbService } from '../../db';
import { ContentEntry } from '../db/schema';
import { ContentServiceImpl } from '../impl/content-service-impl';
import { ContentUtil } from '../util/content-util';

export class GetChildQuestionSetHandler{
    constructor(
        private contentService: ContentServiceImpl,
        private dbService: DbService,
        private storageService: StorageService,
        private fileService: FileService
    ){}

    async handle(questionSetId): Promise<any> {
        const query = this.getQuery(questionSetId);
        let questionSet;
        questionSet = await this.getQuestionSetFromQuery(query);

        if(!questionSet || !questionSet.isAvailableLocally){
            return await this.fetchServerChildQuestions(questionSetId);
        } else if(!questionSet.children){
            return [];
        }
        const path = this.storageService.getStorageDestinationDirectoryPath();
        try{
            questionSet = await this.fetchDBChildQuestions(questionSet, path);
        } catch(e){
            return questionSet.children;
        }
        return questionSet.children;
        
    }

    async fetchDBChildQuestions(questionSet, path){
        if(!questionSet || !questionSet.children ){
            return questionSet;
        }
        const childrenSet: any = [];
        for await (const child of questionSet.children) {
            if(child.objectType === 'QuestionSet'){
                let newQuestionSet;
                const query = this.getQuery(child.identifier);
                newQuestionSet = await this.getQuestionSetFromQuery(query);
                if(newQuestionSet && newQuestionSet.children){
                    newQuestionSet = await this.fetchDBChildQuestions(newQuestionSet, path);
                    childrenSet.push(newQuestionSet);
                }
            } else if(child.objectType === 'Question'){
                const question = await this.fileService.readAsText(`${path}content/${questionSet.identifier}/${child.identifier}`, 'index.json');
                if (question && (typeof question === 'string')) {
                    const data = JSON.parse(question);
                    if(data && data.archive && data.archive.items.length) {
                        childrenSet.push(data.archive.items[0]);
                    }
                }
            }
        }
        questionSet.children = childrenSet;
        return questionSet;
    }

    getQuery(questionSetId){
        return `SELECT * FROM ${ContentEntry.TABLE_NAME} WHERE (${ContentEntry.COLUMN_NAME_IDENTIFIER} = '${questionSetId}')`;
    }

    async getQuestionSetFromQuery(query){
        try {
            const contentInDb = await this.dbService.execute(query).toPromise();
            if(contentInDb && contentInDb.length && contentInDb[0][ContentEntry.COLUMN_NAME_LOCAL_DATA]){
                const questionSetData = JSON.parse(contentInDb[0][ContentEntry.COLUMN_NAME_LOCAL_DATA]);
                questionSetData['isAvailableLocally'] = ContentUtil.isAvailableLocally(contentInDb[0][ContentEntry.COLUMN_NAME_CONTENT_STATE]!);
                return questionSetData;
            }
            return null;
        } catch(e) {
            return null;
        }
    }

    async fetchServerChildQuestions(questionSetId){
        const questionSetData: any = await this.contentService.getQuestionSetHierarchy(questionSetId).toPromise();
        if(questionSetData && questionSetData.questionset && questionSetData.questionset.children){
            return questionSetData.questionset.children
        }
        return [];
    }

}