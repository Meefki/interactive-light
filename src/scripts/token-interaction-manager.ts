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
        const tokens = (game.canvas?.tokens?.objects?.children as any[])
            .filter((t) => t.document.getFlag(flag.scope, flag.lightIdName))
            .map((t) => {
                this.addEventHandler(t);
                return t;
            });

        Logger.log("Retriving tokens linked to a light object", tokens);
    }

    public static addEventHandlerById(tokenId: string) {
        const token = game.canvas?.tokens?.get(tokenId);
        if (token) {
            this.addEventHandler(token);
        }
    }

    public static addEventHandler(token: Token) {
        token.onclick = this.handleTokenClick;
    }

    public static async handleTokenClick(event: any): Promise<boolean> {
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
