import { AmbientLightConfig } from "./ambient-light-config";
import { PermissionManager } from "./permission-manager";
import { TokenInteractionManager } from "./token-interaction-manager";
import { Logger } from "./utils/logger";

export function initHooks() {
    Hooks.once("init", initHook);
    Hooks.once("ready", readyHook);
}

function initHook(data: any) {
    Hooks.on("ready", readyHook);
    Hooks.on(
        "renderAmbientLightConfig",
        AmbientLightConfig.renderLightConfigHook
    );
    // Hooks.on("preUpdateAmbientLight", PermissionManager.ambienLightHiddenChanges);
    Hooks.on("updateAmbientLight", AmbientLightConfig.trackLightPositionHook);
    Hooks.on("deleteAmbientLight", AmbientLightConfig.deleteAmbientLightHook);

    if (!game.modules?.get("socketlib")?.active) {
        Logger.error("Socketlib is not active!");
    }

    PermissionManager.init();
}

function readyHook() {
    TokenInteractionManager.init();
}

export * as register from "./hooks";
