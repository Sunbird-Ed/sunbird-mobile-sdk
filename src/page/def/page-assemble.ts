import {PageAssemble as PageAssembleModel} from '@project-sunbird/client-services';
export {PageSections} from '@project-sunbird/client-services';

export interface PageAssemble extends PageAssembleModel {
    ssoSectionId?: string;
}
