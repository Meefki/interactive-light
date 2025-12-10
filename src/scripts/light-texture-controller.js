import { flag } from "./constants/flags.js";
import { settings } from "./constants/settings.js";
import { FolderManager } from './utils/folder-manager.js';
import { TokenInteractionManager } from "./token-interaction-manager.js";
import { Logger } from "./utils/logger.js";

export class LightTextureController {
    static updateTextureSource = async (
        tokenId,
        lightId,
        path
    ) => {
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
                lightId
            );

            return true;
        } catch (error) {
            Logger.error(`Failed to update token ${tokenId}:`, error);
            return false;
        }
    };

    static deleteTokenHook = async (
        doc,
        options,
        userId
    ) => {
        Logger.log(doc);
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

    static delete = async (
        tokenId,
        document = null
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
            document.setFlag(flag.scope, flag.tokenIdName, tokenId);
            document.setFlag(flag.scope, flag.pathName, "");
        }
    };

    static __createActor = async (
        lightId
    ) => {
        if (!game.user?.isGM) return;

        const folder = await FolderManager.getFolder();

        const actor = await Actor.create({
            name: `light-${lightId}`,
            type: "base",
            folder: folder.id,
        });

        return actor;
    };

    static createActorToken = async (
        imgPath,
        x, y,
        ambientLightDoc
    ) => {
        if (!ambientLightDoc?.id) return;

        const actor = await this.__createActor(ambientLightDoc.id);
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
        (tokenDoc)?.update({ movementAction: "blink" });
        // const token = game.canvas?.tokens?.get(tokenDoc.id);
        // if (token) {
        //     token.onclick = TokenInteractionManager.handleTokenClick;
        //     Logger.log("Tocken created", game.canvas?.tokens?.get(tokenDoc.id));
        //     const module = socketlib.modules.get(flag.scope);
        //     if (module) {
        //         game.users?.forEach((u) => {
        //             if (!u.isGM && u.active) {
        //                 module.executeAsUser("addClickHandler", u.id, token.id);
        //             }
        //         });
        //     }
        // }

        await tokenDoc.setFlag(
            flag.scope,
            flag.lightIdName,
            ambientLightDoc.id
        );
        await ambientLightDoc.setFlag(
            flag.scope,
            flag.tokenIdName,
            tokenDoc.id
        );

        return tokenDoc;
    };

    static changeTokenPositions = async (
        tokenId,
        posX,
        posY
    ) => {
        if (!game.user?.isGM) return false;

        const token = game.canvas?.tokens?.get(tokenId);
        if (!token) {
            Logger.log(`Couldn't find a token with id ${tokenId}`);
            return false;
        }

        const updates = {};

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

    static culcObjPosition = (
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
