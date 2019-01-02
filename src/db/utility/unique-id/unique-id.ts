export class UniqueId {

    constructor() {
    }

    public static generateUniqueId() {
        let date = new Date().getTime();
        if (Date.now) {
            date = Date.now();
        }
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxx'.replace(/[xy]/g, (newUuid) => {
            let r = (date + Math.random() * 16) % 16 | 0;
            date = Math.floor(date / 16);

            return (newUuid === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
        });
    }
}