import { env } from "./constants/environment";
import { flag } from "./constants/flag";
import { PermissionManager } from "./permission-manager";
import { Logger } from "./utils/logger";

export class TokenInteractionManager {
    public static readonly HOOK_NAME = "leftClickToken";
    private static hookId?: number;

    public static init() {
        this.setupTokenClickHandler();
    }

    private static setupTokenClickHandler() {
        const tokens = (game.canvas?.tokens?.objects?.children as Token[])
            .filter((t) => t.document.getFlag(flag.scope, flag.lightIdName))
            .map((t) => this.addEventHandler(t));

        Logger.log("Retriving tokens linked to a light object", tokens);
    }

    public static addEventHandler(token: Token) {
        token.onclick = this.handleTokenClick;

            // const socket = socketlib.modules.get(flag.scope);
            // Logger.log("Socket", socket);
            // if (!socket) return;
            // game.users.forEach((u) => {
            //     if (!u.isGM) {
            //         Logger.log("Add listener for user", u);
            //         socket.executeAsUser("addClickHandler", u.id, token.id);
            //     }
            // });
        // }
    }

    private static async handleTokenClick(event: any): Promise<boolean> {
        const token = event.currentTarget as Token;
        if (!token) return true;
        const lightId = token.document.getFlag(flag.scope, flag.lightIdName);
        if (!lightId) return true;

        await PermissionManager.toggleLightHidden(lightId);

        Logger.log(`Token clicked by ${game.user?.name}`, {
            token: token.id,
            light: lightId,
            user: game.userId,
        });

        return false;
    }
}
