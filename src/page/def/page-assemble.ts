export {PageSection as PageSections} from '@project-sunbird/client-services';
import {Page as PageAssembleModel} from '@project-sunbird/client-services';

export interface PageAssemble extends PageAssembleModel {
    ssoSectionId?: string;
}
