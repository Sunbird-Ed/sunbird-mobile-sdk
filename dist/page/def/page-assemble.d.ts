export { PageSection as PageSections } from '@project-sunbird/client-services/models';
import { Page as PageAssembleModel } from '@project-sunbird/client-services/models';
export interface PageAssemble extends PageAssembleModel {
    ssoSectionId?: string;
}
