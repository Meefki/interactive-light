import { flag } from "./constants/flag";
import { TokenInteractionManager } from "./token-interaction-manager";
import { Logger } from "./utils/logger";

export class PermissionManager {
    public static init = () => {
        socketlib.registerModule(flag.scope);
        this.socketRegisterToggleLightHidden();
        this.socketRegisterAddClickHandler();
    };

    private static socketRegisterToggleLightHidden = () => {
        const socket = socketlib.modules.get(flag.scope);
        if (!socket) return;
        socket.register("toggleLightHidden", (lightId: string) => {
            Logger.log("Chached the event");
            const light = game.canvas?.lighting?.get(lightId);
            if (!light) return false;
            Logger.log("Updating light document");
            return light.document.update({ hidden: !light.document.hidden });
        });
    };

    private static socketRegisterAddClickHandler = () => {
        const socket = socketlib.modules.get(flag.scope);
        if (!socket) return;
        socket.register(
            "addClickHandler",
            (tokenId: string, userId: string) => {
                const token = game.canvas?.tokens?.get(tokenId);
                Logger.log(token);
                if (!token) return;
                TokenInteractionManager.addEventHandler(token);
            }
        );
    };

    public static toggleLightHidden = async (lightId: string) => {
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
