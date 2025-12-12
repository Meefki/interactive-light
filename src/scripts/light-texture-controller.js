import { flag } from "./constants/flags.js";
import { settings } from "./constants/settings.js";
import { Logger } from "./utils/logger.js";

export class LightTextureController {
    static updateTextureSource = async (
        tileId,
        lightId,
        path
    ) => {
        if (!game.user?.isGM) return false;
        if (!tileId) return false;

        const tile = game.canvas?.tiles?.get(tileId);
        Logger.log(tile);

        if (!tile) {
            Logger.warn(`tile with ID ${tileId} not found`);
            return false;
        }

        try {
            Logger.log(`UPDATING tile ${tileId} TEXTURE SOURCE`);

            await tile.document.update({
                texture: { src: path },
            });
            await tile.document.setFlag(
                flag.scope,
                flag.lightIdName,
                lightId
            );

            return true;
        } catch (error) {
            Logger.error(`Failed to update tile ${tileId}:`, error);
            return false;
        }
    };

    static delete = async (
        tileId,
        document = null
    ) => {
        if (!game.user?.isGM) return;

        if (tileId) {
            const sceneTile = game.scenes.current?.tiles.get(tileId);
            const canvasTile = game.canvas?.tiles?.get(tileId);
            if (sceneTile) {
                Logger.log(`DELETING tile: ${tileId}`);

                if (canvasTile) game.canvas?.tiles?.removeChild(canvasTile);
                await sceneTile.delete();
            }
        }

        if (document) {
            document.setFlag(flag.scope, flag.tileIdName, tileId);
            document.setFlag(flag.scope, flag.pathName, "");
        }
    };

    static __createTile = async (tileDoc) => 
        await new foundry.canvas.placeables.Tile(tileDoc);

    static createTile = async (
        imgPath,
        x, y,
        ambientLightDoc
    ) => {
        if (!ambientLightDoc?.id) return;

        Logger.log("light pos", `${x} : ${y}`);
        const tileDoc = await TileDocument.create(
            {
                name: `light-${ambientLightDoc.id}`,
                x: this.calcObjPosition(x, "X"),
                y: this.calcObjPosition(y, "Y"),
                width: settings.tileWidth,
                height: settings.tileHeight,
                texture: {
                    src: imgPath,
                },
            },
            { parent: canvas.scene }
        );
        Logger.log("tile doc created", tileDoc);
        if (!tileDoc) return;

        const tile = await this.__createTile(tileDoc);
        if (!tile) return;

        await tileDoc.setFlag(
            flag.scope,
            flag.lightIdName,
            ambientLightDoc.id
        );
        await ambientLightDoc.setFlag(
            flag.scope,
            flag.tileIdName,
            tileDoc.id
        );

        return tileDoc;
    };

    static changeTilePositions = async (
        tileId,
        posX,
        posY
    ) => {
        if (!game.user?.isGM) return false;

        const tile = game.canvas?.tiles?.get(tileId);
        if (!tile) {
            Logger.log(`Couldn't find a tile with id ${tileId}`);
            return false;
        }

        const updates = {};

        if (posX === 0 || posX) {
            const x = this.calcObjPosition(posX, "X");
            updates.x = x;
            Logger.log(`POS X UPDATED: ${x}`);
        }

        if (posY === 0 || posY) {
            const y = this.calcObjPosition(posY, "Y")
            updates.y = y;
            Logger.log(`POS Y UPDATED: ${y}`);
        }

        if (Object.keys(updates).length > 0) {
            try {
                await tile.document.update(updates);
            } catch (error) {
                Logger.error(`Unnable to update tile [${tileId}]`);
                console.log(error);
            }
        }

        return true;
    };

    static calcObjPosition = (
        light,
        axis
    ) => {
        return light - this.__getTileSize(axis) / 2;
    };

    static __getTileSize = (axis) => {
        switch (axis) {
            case "X":
                return settings.tileWidth;
            case "Y":
                return settings.tileHeight;
        }
    };
}
