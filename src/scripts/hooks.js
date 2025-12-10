import { hook_alias } from "./constants/hook_alias.js";
import { AmbientLightConfig } from "./ambient-light-config.js";
import { Logger } from "./utils/logger.js"; 
import { LightTextureController } from "./light-texture-controller.js";
import { PermissionManager } from "./permission-manager.js";
import { TokenInteractionManager } from "./token-interaction-manager.js";

export function initHooks() {
    Logger.info("Init hooks...");
    Hooks.once(hook_alias.init, initHook);
    Logger.info("Hooks Init Finished!");
}

function initHook(data) {
    TokenInteractionManager.AddSingleClickWrapper();
    TokenInteractionManager.AddDoubleClickWrapper();

    Hooks.on(
        hook_alias.renderAmbientLightConfig,
        AmbientLightConfig.renderLightConfigHook
    );
    Hooks.on(hook_alias.updateAmbientLight, AmbientLightConfig.trackLightPositionHook);
    Hooks.on(hook_alias.deleteAmbientLight, AmbientLightConfig.deleteAmbientLightHook);
    Hooks.on(hook_alias.deleteToken, LightTextureController.deleteTokenHook);

    if (!game.modules?.get("socketlib")?.active) {
        Logger.error("Socketlib is not active!");
    }
    PermissionManager.init();
}

export * as register from "./hooks.js";