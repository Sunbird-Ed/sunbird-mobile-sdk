import { Content } from "@project-sunbird/client-services/models";
import { Visibility } from "../..";

export class HierarchyManifestConversion {
    private archive: { count: number, items: Content[] };
    private identifierList = new Set();

    hierarchyToManifestConversion(content) {
        this.identifierList = new Set();
        this.archive = {
            count: 0,
            items: []
        }
        let depth = 1

        const contentData = this.reorderData(content, depth);
        if (contentData) {
            this.archive.count += 1;
            this.archive.items.push(contentData);
        }
        if (content.children && content.children.length) {
            this.recurssiveFunc(content.children, depth);
        }
        return this.archive;
    }

    private recurssiveFunc(childrenList, depth) {
        for (let index = 0; index < childrenList.length; index++) {
            const contentData = this.reorderData(childrenList[index], depth + 1, Visibility.PARENT.valueOf())
            if (contentData) {
                this.archive.count += 1;
                this.archive.items.push(contentData);
            }
            if (childrenList[index].children && childrenList[index].children.length) {
                this.recurssiveFunc(childrenList[index].children, depth + 1);
            }
        }
    }

    private reorderData(content: Content, depth: number, visibility?) {
        if (this.identifierList.has(content.identifier)) {
            return null;
        }
        const newChildren: any = [];
        const newContent = JSON.parse(JSON.stringify(content));
        if (newContent.children && newContent.children.length) {
            for (let index = 0; index < newContent.children.length; index++) {
                newChildren.push({
                    name: newContent.children[index].name,
                    identifier: newContent.children[index].identifier,
                    objectType: newContent.children[index].objectType,
                    depth: depth,
                    index
                });
            }
            newContent.children = newChildren;
        }
        newContent.visibility = visibility ? visibility : newContent.visibility;
        this.identifierList.add(newContent.identifier);
        return newContent;
    }

}