export class ContentHandler {

    public static string;

    processContentRow(row: string) {
        const data = JSON.parse(row);

        return JSON.stringify(data);
    }
}
