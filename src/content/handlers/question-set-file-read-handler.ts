import { from } from 'rxjs';
import { map } from 'rxjs/operators';
import { StorageService } from '../../storage/def/storage-service';
import {FileService} from '../../util/file/def/file-service';

export class QuestionSetFileReadHandler{
    constructor(
        private storageService: StorageService,
        private fileService: FileService
    ){}

    public async getLocallyAvailableQuestion(questionIds, parentId){
        const path = this.storageService.getStorageDestinationDirectoryPath();
        let questionList: any = [];
        let devicePlatform = "";
        await window['Capacitor']['Plugins'].Device.getInfo().then((val) => {
            devicePlatform = val.platform
        })
        questionIds.forEach(async id => {
            const textData = this.fileService.readAsText((devicePlatform.toLowerCase() === "ios") 
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