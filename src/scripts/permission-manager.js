import { flag } from "./constants/flags.js";
import { TokenInteractionManager } from "./token-interaction-manager.js";
import { Logger } from "./utils/logger.js";

export class PermissionManager {
    static init = () => {
        socketlib.registerModule(flag.scope);
        this.__socketRegisterToggleLightHidden();
        this.__socketRegisterAddClickHandler();
    };

    static __socketRegisterToggleLightHidden = () => {
        const socket = socketlib.modules.get(flag.scope);
        if (!socket) return;
        socket.register("toggleLightHidden", (lightId) => {
            Logger.log("Chached the event");
            const light = game.canvas?.lighting?.get(lightId);
            if (!light) return false;
            Logger.log("Updating light document");
            return light.document.update({ hidden: !light.document.hidden });
        });
    };

    static __socketRegisterAddClickHandler = () => {
        const socket = socketlib.modules.get(flag.scope);
        if (!socket) return;
        socket.register(
            "addClickHandler",
            (tokenId, userId) => {
                const token = game.canvas?.tokens?.get(tokenId);
                Logger.log(token);
                if (!token) return;
                TokenInteractionManager.addEventHandler(token);
            }
        );
    };

    static toggleLightHidden = async (lightId) => {
        if (!lightId) return;
        const light = game.canvas?.lighting?.get(lightId);
        if (!light) return;
        Logger.log("Found light", light);

        if (game.user?.isGM) {
            Logger.log("GM's click, allow to change the light");
            await light.document.update({ hidden: !light.document.hidden });
            return;
        }

        Logger.log("User's click, sending the request to the server");

        Logger.log("sending the request to the server");
        Logger.log(socketlib);
        Logger.log(socketlib.modules);
        if (socketlib.modules.get(flag.scope)) {
            const module = socketlib.modules.get(flag.scope);
            if (!module) return;

            module.executeAsGM("toggleLightHidden", lightId);
        } else {
            Logger.error(`Couldn't find a registered module ${flag.scope}`);
        }
        Logger.log(socketlib.modules);
    };
}
