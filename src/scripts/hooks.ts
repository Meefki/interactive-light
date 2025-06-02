import { AmbientLightConfig } from "./ambient-light-config";
import { flag } from "./constants/flag";
import { LightTextureController } from "./light-texture-controller";
import { PermissionManager } from "./permission-manager";
import { TokenInteractionManager } from "./token-interaction-manager";
import { Logger } from "./utils/logger";

export function initHooks() {
    Hooks.once("init", initHook);
    Hooks.once("ready", readyHook);
}

function initHook(data: any) {
    // Hooks.on("ready", readyHook);
    Hooks.on("canvasReady", TokenInteractionManager.init);

    Hooks.on(
        "renderAmbientLightConfig",
        AmbientLightConfig.renderLightConfigHook
    );
    Hooks.on("updateAmbientLight", AmbientLightConfig.trackLightPositionHook);
    Hooks.on("deleteAmbientLight", AmbientLightConfig.deleteAmbientLightHook);
    Hooks.on("deleteToken", LightTextureController.deleteTokenHook);

    if (!game.modules?.get("socketlib")?.active) {
        Logger.error("Socketlib is not active!");
    }
    PermissionManager.init();
}

function readyHook() {
    // TokenInteractionManager.init();
}

export * as register from "./hooks";
