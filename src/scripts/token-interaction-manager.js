import { flag } from "./constants/flags.js";
import { PermissionManager } from "./permission-manager.js";
import { Logger } from "./utils/logger.js";

export class TokenInteractionManager {
    static HOOK_NAME = "leftClickToken";

    static init = () => {
        // this.__setupTokenClickHandler();
    }

    // 1. Add wrappers for tokens
    static AddSingleClickWrapper() { 
        Logger.info("Registering wrapper for a single click");
        libWrapper.register(
            'interactive-light',
            'foundry.canvas.placeables.Token.prototype._onClickLeft',
            function (wrapped, event) {
                Logger.log("Single click on: ", this);
                Logger.log("Logging event (single click):", event)
                const lightInfo = TokenInteractionManager.__getLightConfig(this);
                if (!lightInfo || !lightInfo.lightId)
                    return wrapped.call(this, event);
                
                if (lightInfo.mode === 1)
                    TokenInteractionManager.__handleTokenClick(this);
                return wrapped.call(this, event);
            },
            libWrapper.MIXED
        );
        Logger.info("The wrapper for a single click registered");
    }

    static AddDoubleClickWrapper() {
        Logger.info("Registering wrapper for a double click");
        libWrapper.register(
            'interactive-light',
            'foundry.canvas.placeables.Token.prototype._onClickLeft2',
            function (wrapped, event) {
                Logger.log("Double click on: ", this);
                Logger.log("Logging event (double click):", event)
                const lightInfo = TokenInteractionManager.__getLightConfig(this);
                if (!lightInfo || !lightInfo.lightId) 
                    return wrapped.call(this, event);
                
                if (lightInfo.mode === 0)
                    TokenInteractionManager.__handleTokenClick(event.currentTarget);
                return true;
            },
            libWrapper.MIXED
        );
        Logger.info("The wrapper for a double click registered");
    }

    static async __handleTokenClick(t) {
        if (!t) {
            Logger.log("TokenInteractionManager.__handleTokenClick: Empty token");
            return;
        }

        const lightInfo = this.__getLightConfig(t);
        if (!lightInfo || !lightInfo.lightId) return;
        
        await PermissionManager.toggleLightHidden(lightInfo.lightId);

        Logger.log(`Token clicked by ${game.user?.name}`, {
            token: t.id,
            light: lightInfo.lightId,
            user: game.userId,
        });
    }

    static __getLightConfig(t) {
        if (!t) {
            Logger.log("TokenInteractionManager.__getLightConfig: Empty token");
            return;
        }
        
        const lightId = t.document.getFlag(flag.scope, flag.lightIdName);
        if (!lightId) {
            Logger.log("TokenInteractionManager.__getLightConfig: Empty light ID");
            return;
        }
        const lights = game.canvas.lighting.objects.children;
        if (lights && lights.length) {
            const filteredLights = lights.filter(l => l.id === lightId);
            if (filteredLights && filteredLights.length) {
                const mode = filteredLights[0].document.getFlag(flag.scope, flag.clickOptionsName);
                return { lightId, mode };
            }
            Logger.log("TokenInteractionManager.__getLightConfig: Light not found");
        }
        Logger.log("TokenInteractionManager.__getLightConfig: No lights on the layer");
    }
}
