import { settings } from "./constants/settings";

export class FolderController {
    public static getFolder = async (): Promise<Folder.Stored> => {
        let folder = game.folders?.getName(settings.actorFolderName);
        if (!folder) {
            folder = await this.createFolder();
        }

        return folder;
    }

    private static createFolder = async (): Promise<Folder.Stored> => {
        const folder = await Folder.create({
            name: settings.actorFolderName,
            type: "Actor"
        });

        return folder as Folder.Stored;
    }
}