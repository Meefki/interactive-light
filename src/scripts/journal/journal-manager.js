import { flag } from "../constants/flags.js";
import { Logger } from "../utils/logger.js";
import { generateTagColor } from "../utils/tag-color.js"

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

        return prefabObj;
    }

    static async savePrefab(prefab) {
        const journal = await this.getOrCreatePrefabLibrary();
        const prefabs = this.getPrefabs(journal);
        prefabs[prefab.id] = prefab;

        await journal.setFlag(flag.scope, flag.prefabsName, prefabs);

        return prefab.id;
    }

    static async deletePrefab(prefabId) {
        const journal = await this.getOrCreatePrefabLibrary();
        const prefabs = await this.getPrefabs(journal);

        delete prefabs[prefabId];
        await journal.unsetFlag(flag.scope, `${flag.prefabsName}.${prefabId}`);
    }

    static async getAllTags() {
        const prefabs = await this.getPrefabs();
        const prefabIds = Object.keys(prefabs);
        const tags = [];
        for (let id of prefabIds) {
            const items = prefabs[id]?.light?.document?.flags?.[flag.scope]?.[flag.prefabTagsName] ?? [];
            tags.push(...items);
        }
        const uniqueTags = tags.filter((v, i, a) => a.indexOf(v) === i).map(tv => {
            return {
                value: tv,
                color: generateTagColor(tv)
            }
        });
        return uniqueTags;
    }

    // mode: false - light id or doc, true - prefab id
    // TODO: by light id
    static async getPrefabTags(id, mode, document) {
        let tags = [];
        if (mode) {
            const prefab = await this.getPrefab(id);
            tags = prefab?.light?.document?.flags?.[flag.scope]?.[flag.prefabTagsName];
        }

        if (document) {
            tags = document.flags?.[flag.scope]?.[flag.prefabTagsName]
        }

        if (tags) {
            tags = Array.isArray(tags) ? tags : [tags];
            tags = tags.map(tv => {
                return {
                    value: tv,
                    color: generateTagColor(tv)
                }
            }) ?? [];
        }

        return tags ?? [];
    }

    static async getPrefab(prefabId, journal = null) {
        if (!journal)
            journal = await this.getOrCreatePrefabLibrary();

        const prefab = foundry.utils.deepClone(
            journal.getFlag(flag.scope, `${flag.prefabsName}.${prefabId}`) ?? {}
        )

        return prefab;
    }

    static async getPrefabs(journal = null) {
        if (!journal)
            journal = await this.getOrCreatePrefabLibrary();

        const prefabs = foundry.utils.deepClone(
            journal.getFlag(flag.scope, flag.prefabsName) ?? {}
        )

        return prefabs;
    }
}