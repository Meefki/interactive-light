import { hook_alias } from "./constants/hook_alias.js";
import { AmbientLightConfig } from "./ambient-light-config.js";
import { Logger } from "./utils/logger.js"; 
import { LightTextureController } from "./light-texture-controller.js";
import { PermissionManager } from "./permission-manager.js";
import { LibManager } from "./utils/lib-manager.js";
import { TileInteractionManager } from "./tile-interaction-manager.js";
import { settings } from "./constants/settings.js";

export function initHooks() {
    Logger.info("Init hooks...");
    Hooks.once(hook_alias.init, initHook);
    onCanvasReadyHook();
    Logger.info("Hooks Init Finished!");
}

function initHook(data) {
    if (moduleDepsCheck()) return;

    TileInteractionManager.AddClickHandlers();

    Hooks.on(
        hook_alias.renderAmbientLightConfig,
        AmbientLightConfig.renderLightConfigHook
    );
    Hooks.on(hook_alias.updateAmbientLight, AmbientLightConfig.trackLightPositionHook);
    Hooks.on(hook_alias.deleteAmbientLight, AmbientLightConfig.deleteAmbientLightHook);

    PermissionManager.init();
}

function onCanvasReadyHook() {
    Hooks.on(hook_alias.canvasReady, settings.initSettings);
}

function moduleDepsCheck() {
    let libError = false;
    if (!LibManager.checkLibWrapper()) {
        Logger.error("lib-wrapper module wasn't found");
        libError = true;
    }

    if (!LibManager.checkSocketLib()) {
        Logger.error("socketlib module wasn't found");
        libError = true;
    }

    return libError;
}

export * as register from "./hooks.js";