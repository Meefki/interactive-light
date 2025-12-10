import { settings } from "./constants/settings.js";

export class FolderController {
    static getFolder = async () => {
        let folder = game.folders?.getName(settings.actorFolderName);
        if (!folder) {
            folder = await this.__createFolder();
        }

        return folder;
    }

    static __createFolder = async () => {
        const folder = await Folder.create({
            name: settings.actorFolderName,
            type: "Actor"
        });

        return folder;
    }
}