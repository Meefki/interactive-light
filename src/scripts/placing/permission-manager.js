import { flag } from "../constants/flags.js";
import { Logger } from "../utils/logger.js";

export class PermissionManager {
    static init = () => {
        socketlib.registerModule(flag.scope);
        this.#socketRegisterToggleLightHidden();
    };

    static #socketRegisterToggleLightHidden = () => {
        const socket = socketlib.modules.get(flag.scope);
        if (!socket) return;
        socket.register("toggleLightHidden", (lightId) => {
            const light = game.canvas?.lighting?.get(lightId);
            if (!light) return false;
            return light.document.update({ hidden: !light.document.hidden });
        });
    };

    static toggleLightHidden = async (lightId) => {
        if (!lightId) return;
        const light = game.canvas?.lighting?.get(lightId);
        if (!light) return;

        if (game.user?.isGM) {
            Logger.info("GM's click, allow to change the light");
            await light.document.update({ hidden: !light.document.hidden });
            return;
        }

        Logger.info("User's click, sending the request to the server");

        Logger.info("sending the request to the server");
        if (socketlib.modules.get(flag.scope)) {
            const module = socketlib.modules.get(flag.scope);
            if (!module) return;

            module.executeAsGM("toggleLightHidden", lightId);
        } else {
            Logger.error(`Couldn't find a registered module ${flag.scope}`);
        }
    };
}
