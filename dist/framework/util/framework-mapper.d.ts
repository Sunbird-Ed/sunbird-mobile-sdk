import { Framework, FrameworkCategory } from '..';
export declare class FrameworkMapper {
    static prepareFrameworkCategoryAssociations(framework: Framework): Framework;
    static prepareFrameworkTranslations(framework: Framework, language: string): Framework;
    static prepareFrameworkCategoryTranslations(frameworkCategory: FrameworkCategory, language: string): FrameworkCategory;
    private static getTranslatedValue;
}
