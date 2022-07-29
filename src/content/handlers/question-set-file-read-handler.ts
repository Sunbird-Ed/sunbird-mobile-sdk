import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from '../../storage/def/storage-service';
import {FileService} from '../../util/file/def/file-service';

export class QuestionSetFileReadHandler{
    constructor(
        private storageService: StorageService,
        private fileService: FileService
    ){}

    public getLocallyAvailableQuestion(questionIds, parentId){
        const path = this.storageService.getStorageDestinationDirectoryPath();
        let questionList: any = [];
        questionIds.forEach(async id => {
            const textData = this.fileService.readAsText((window.device.platform.toLowerCase() === "ios") 
                            ? `${path}/content/${parentId}/${id}` : `${path}content/${parentId}/${id}`, 'index.json');
            questionList.push(textData);
        });
        return from(Promise.all(questionList)).pipe(
            map(questions => {
                return {
                    questions: questions.map((q: any) => {
                        if (q && (typeof q === 'string')) {
                            const data = JSON.parse(q);
                            return data.archive.items[0];
                        }
                        return q;
                    }),
                    count: questions.length
                }
            })
        );
    }

}