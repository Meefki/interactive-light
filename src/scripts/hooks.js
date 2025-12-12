import { hook_alias } from "./constants/hook_alias.js";
import { AmbientLightConfig } from "./placing/ambient-light-config.js";
import { Logger } from "./utils/logger.js";
import { PermissionManager } from "./placing/permission-manager.js";
import { TileInteractionManager } from "./placing/tile-interaction-manager.js";
import { LibManager } from "./utils/lib-manager.js";
import { settings } from "./constants/settings.js";
import { Menu } from "./menu/menu.js";

export function initHooks() {
    Logger.info("Init hooks...");
    Hooks.once(hook_alias.init, initHook);
    onCanvasReadyHook();
    onGetSceneControlButtons();
    Logger.info("Hooks Init Finished!");
}

function initHook(data) {
    if (moduleDepsCheck()) return;

    Menu.registerMenu();

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

function onGetSceneControlButtons() {
    Hooks.on(hook_alias.getSceneControlButtons, Menu.registerMenu);
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