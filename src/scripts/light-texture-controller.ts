import { flag } from "./constants/flag";
import { settings } from "./constants/settings";
import { FolderController } from "./folder-controller";
import { TokenInteractionManager } from "./token-interaction-manager";
import { Logger } from "./utils/logger";

export class LightTextureController {
    public static updateTextureSource = async (
        tokenId: string,
        lightId: string,
        path: string
    ): Promise<boolean> => {
        if (!game.user?.isGM) return false;
        if (!tokenId) return false;

        const token = game.canvas?.tokens?.get(tokenId);
        Logger.log(token);

        if (!token) {
            Logger.warn(`Token with ID ${tokenId} not found`);
            return false;
        }

        try {
            Logger.log(`UPDATING TOKEN ${tokenId} TEXTURE SOURCE`);

            await token.document.update({
                texture: { src: path },
            });
            await token.document.setFlag(
                flag.scope,
                flag.lightIdName,
                lightId as never
            );

            return true;
        } catch (error) {
            Logger.error(`Failed to update token ${tokenId}:`, error);
            return false;
        }
    };

    public static deleteTokenHook = async (
        doc: TokenDocument,
        options: any,
        userId: string
    ) => {
        if (doc.getFlag(flag.scope, flag.lightIdName)) {
            const actorId = doc.actor?.id;
            if (actorId) {
                const actor = game.actors?.get(actorId);
                if (actor) {
                    Logger.log(`DELETING ASSOCIATED ACTOR: ${actorId}`);
                    await actor.delete();
                }
            }
        }
    };

    public static delete = async (
        tokenId: string,
        document: AmbientLightDocument | null = null
    ) => {
        if (!game.user?.isGM) return;

        if (tokenId) {
            const sceneToken = game.scenes.current?.tokens.get(tokenId);
            const canvasToken = game.canvas?.tokens?.get(tokenId);
            if (sceneToken) {
                Logger.log(`DELETING TOKEN: ${tokenId}`);

                if (canvasToken) game.canvas?.tokens?.removeChild(canvasToken);
                await sceneToken.delete();
            }
        }

        if (document) {
            document.setFlag(flag.scope, flag.tokenIdName, tokenId as never);
            document.setFlag(flag.scope, flag.pathName, "" as never);
        }
    };

    private static createActor = async (
        lightId: string
    ): Promise<Actor | undefined> => {
        if (!game.user?.isGM) return;

        const folder = await FolderController.getFolder();

        const actor = await Actor.create({
            name: `light-${lightId}`,
            type: "base",
            folder: folder.id,
        });

        return actor;
    };

    public static createActorToken = async (
        imgPath: string,
        x: number,
        y: number,
        ambientLightDoc: AmbientLightDocument
    ): Promise<TokenDocument | undefined> => {
        if (!ambientLightDoc?.id) return;

        const actor = await this.createActor(ambientLightDoc.id);
        if (!actor) return;

        Logger.log("light pos", `${x} : ${y}`);
        const tokenDoc = await TokenDocument.create(
            {
                name: actor.name,
                actorId: actor.id,
                x: x,
                y: y,
                width: 1,
                height: 1,
                disposition: CONST.TOKEN_DISPOSITIONS.SECRET,
                texture: {
                    src: imgPath,
                    anchorX: 0.5,
                    anchorY: 0.5,
                },
            },
            { parent: canvas.scene }
        );

        Logger.log("Token doc created", tokenDoc);
        if (!tokenDoc) return;
        (tokenDoc as any)?.update({ movementAction: "blink" });
        const token = game.canvas?.tokens?.get(tokenDoc.id);
        if (token) {
            token.onclick = TokenInteractionManager.handleTokenClick;
            Logger.log("Tocken created", game.canvas?.tokens?.get(tokenDoc.id));
            const module = socketlib.modules.get(flag.scope);
            if (module) {
                game.users?.forEach((u) => {
                    if (!u.isGM && u.active) {
                        module.executeAsUser("addClickHandler", u.id, token.id);
                    }
                });
            }
        }

        await tokenDoc.setFlag(
            flag.scope,
            flag.lightIdName,
            ambientLightDoc.id as never
        );
        await ambientLightDoc.setFlag(
            flag.scope,
            flag.tokenIdName,
            tokenDoc.id as never
        );

        return tokenDoc;
    };

    public static changeTokenPositions = async (
        tokenId: string,
        posX: number,
        posY: number
    ): Promise<boolean> => {
        if (!game.user?.isGM) return false;

        const token = game.canvas?.tokens?.get(tokenId);
        if (!token) {
            Logger.log(`Couldn't find a token with id ${tokenId}`);
            return false;
        }

        const updates: Record<string, number> = {};

        if (posX === 0 || posX) {
            const x = this.culcObjPosition(posX, "X");
            updates.x = x;
            Logger.log(`POS X UPDATED: ${x}`);
        }

        if (posY === 0 || posY) {
            const y = this.culcObjPosition(posY, "Y");
            updates.y = y;
            Logger.log(`POS Y UPDATED: ${y}`);
        }

        if (Object.keys(updates).length > 0) {
            try {
                await token.document.update(updates);
            } catch (error) {
                Logger.error(`Unnable to update token [${tokenId}]`);
                console.log(error);
            }
        }

        return true;
    };

    public static culcObjPosition = (
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
}
