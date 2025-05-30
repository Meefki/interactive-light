import { PIXI } from "fvtt-types/configuration";
import { flag, interactive } from "./constants/flag";
import { settings } from "./constants/settings";
import { Switcher } from "./switch";
import { Logger } from "./utils/logger";

export class AmbientLightTileController {
    public static updateTileTextureSource = (
        tileId: string,
        lightId: string,
        path: string
    ): boolean => {
        if (tileId) {
            const tile = game.canvas?.tiles?.get(tileId);
            if (settings.debug) Logger.log(tile);
            if (tile) {
                if (settings.debug)
                    Logger.log(`UPDATING TILE ${tileId} TEXTURE SOURCE`);
                tile.document.setFlag(
                    flag.scope,
                    flag.lightIdName,
                    lightId as never
                );
                tile.document.update({ texture: { src: path } });
                return true;
            }
        }

        return false;
    };

    public static deleteTile(
        tileId: string,
        document: AmbientLightDocument | null
    ) {
        if (tileId) {
            const tile = game.canvas?.tiles?.get(tileId);
            if (tile) {
                if (settings.debug) Logger.log(`DELETING TILE: ${tileId}`);
                game.canvas?.tiles?.removeChild(tile);
                tile.document.delete();
            }
        }

        if (document) {
            document.setFlag(flag.scope, flag.tileIdName, tileId as never);
            document.setFlag(flag.scope, flag.pathName, "" as never);
        }
    }

    public static createTile = async (
        imgPath: string,
        x: number,
        y: number,
        ambientLightDoc: AmbientLightDocument
    ): Promise<TileDocument | undefined> => {
        if (settings.debug) Logger.log("CREATING NEW TILE");

        const tileDoc = await TileDocument.create(
            {
                height: settings.tileHeight,
                width: settings.tileWidth,
                x: x,
                y: y,
                texture: {
                    src: imgPath,
                    anchorX: 0.5,
                    anchorY: 0.5,
                },
            },
            { parent: canvas.scene }
        );
        Logger.log(tileDoc);
        if (!tileDoc) return;

        tileDoc.setFlag(
            flag.scope,
            flag.lightIdName,
            ambientLightDoc.id as never
        );
        ambientLightDoc.setFlag(
            flag.scope,
            flag.tileIdName,
            tileDoc.id as never
        );

        // const tile = canvas.tiles?.get(tileDoc._id);
        // if (tile) {
        //     tile.interactive = true;
        //     tile.on("pointerdown", (event) => {
        //         Logger.log("clicked");
        //         Switcher.switchLight(event);
        //     });
        // }
        // Logger.log(tile);

        if (settings.debug) Logger.log(`TILE DOC CREATED: ${tileDoc.id}`);
        return tileDoc;
    };

    public static changeTilePositions = (
        tileId: string,
        posX: number,
        posY: number
    ): boolean => {
        const tile = game.canvas?.tiles?.get(tileId);
        if (!tile) {
            Logger.log(`Couldn't find a tile with id ${tileId}`);
            return false;
        }

        if (posX == 0 || posX) {
            const x = this.culcTilePosition(posX, "X");
            tile.document.update({ x: x });
            Logger.log(`POS X UPDATED: ${x}`);
        }
        if (posY == 0 || posY) {
            const y = this.culcTilePosition(posY, "Y");
            tile.document.update({ y: y });
            Logger.log(`POS Y UPDATED: ${y}`);
        }

        return true;
    };

    public static culcTilePosition = (
        light: number,
        axis: "X" | "Y"
    ): number => {
        return light - this.getTileSize(axis) / 2;
    };

    private static getTileSize = (axis: "X" | "Y"): number => {
        switch (axis) {
            case "X":
                return settings.tileWidth;
            case "Y":
                return settings.tileHeight;
        }
    };

    public static initTitles = () => {
        // canvas.tiles?.placeables.forEach((t) => {
        //     if (t.document.getFlag(flag.scope, flag.lightIdName)) {
        //         this.registerTileClickEvent(t.document);
        //     }
        // });
    };

    public static registerTileClickEvent = (tileDoc: TileDocument) => {
        // Logger.log(`Register Tile click event`, tileDoc);
        // if (!tileDoc.getFlag(flag.scope, flag.lightIdName)) return;
        // if (!tileDoc.id) return;
        // const tile = canvas.tiles?.get(tileDoc.id);
        // if (!tile) return;
        // tile.interactive = true;
        // tile.hitArea = new PIXI.Rectangle(0, 0, tile.width, tile.height);
        // tile.on("pointerdown", Switcher.switchLight);
        // Logger.log(tile);
    };
}
