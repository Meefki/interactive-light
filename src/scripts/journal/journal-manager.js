import { flag } from "../constants/flags.js";
import { Logger } from "../utils/logger.js";

export class JournalManager {
    static async getOrCreatePrefabLibrary() {
        let journal = game.journal.find(j => j.getFlag(flag.scope, flag.prefabLibraryName))

        if (journal) return journal;

        return JournalEntry.create({
            name: "Light Prefab Library",
            flags: {
                [flag.scope]: {
                    prefabLibrary: true,
                    prefabs: {}
                }
            }
        });
    }

    static buildLightPrefabV1(lightDocument) {
        Logger.log("JournalManager.buildLightPrefabV1.lightDocument:", lightDocument);
        if (!(lightDocument instanceof AmbientLightDocument)) {
            Logger.error("Expected AmbientLightDocument");
            return;
        }

        const scene = lightDocument.parent;
        if (!scene) {
            Logger.error("Light has no parent scene");
            return;
        }

        const lightData = lightDocument.toObject();
        delete lightData._id;
        delete lightData.x;
        delete lightData.y;

        const prefabObj = {
            schema: 1,
            id: foundry.utils.randomID(),
            name: lightDocument.getFlag(flag.scope, flag.prefabName) || "Light Prefab",
            created: Date.now(),
            light: {
                document: lightData
            }
        }

        const tileId = lightDocument.getFlag(flag.scope, flag.tileIdName);
        Logger.log("buildLightPrefabV1.tileId", tileId);
        if (tileId) {
            const tileDocument = scene.tiles.get(tileId);
            if (!tileDocument) {
                Logger.error(`Tile ${tileId} not found in scene`);
                return;
            }

            const tileData = tileDocument.toObject();
            delete tileData._id;
            delete tileData.x;
            delete tileData.y;

            prefabObj.tile = {};
            prefabObj.tile.document = tileData;
        }

        Logger.log("buildLightPrefabV1.prefabObj", prefabObj);
        return prefabObj;
    }

    static async savePrefab(prefab) {
        Logger.log("JournalManager.savePrefab.prefab:", prefab);
        const journal = await this.getOrCreatePrefabLibrary();
        Logger.log("JournalManager.savePrefab.journal:", journal);
        const prefabs = foundry.utils.deepClone(
            journal.getFlag(flag.scope, flag.prefabsName) ?? {}
        )
        Logger.log("JournalManager.savePrefab.prefabs:", prefabs);
        prefabs[prefab.id] = prefab;

        await journal.setFlag(flag.scope, flag.prefabsName, prefabs);

        return prefab.id;
    }

    static async deletePrefab(prefabId) {
        const journal = await this.getOrCreatePrefabLibrary();
        const prefabs = foundry.utils.deepClone(
            journal.getFlag(flag.scope, flag.prefabsName) ?? {}
        )

        delete prefabs[prefabId];
        Logger.log("JournalManager.deletePrefab.prefabs:", prefabs);
        await journal.unsetFlag(flag.scope, `${flag.prefabsName}.${prefabId}`);
        Logger.log("JournalManager.deletePrefab.journal prefabs:", journal.getFlag(flag.scope, flag.prefabsName));
    }
}