import { AmbientLightTileController } from "./ambient-ight-tile-controller";
import { AmbientLightConfig } from "./ambient-light-config";
import { Switcher } from "./switch";

export function initHooks() {
    Hooks.once("init", initHook);
}

function initHook(data: any) {
    Hooks.on("ready", readyHook);
    Hooks.on(
        "renderAmbientLightConfig",
        AmbientLightConfig.renderLightConfigHook
    );
    Hooks.on("updateAmbientLight", AmbientLightConfig.trackLightPositionHook);
    Hooks.on("deleteAmbientLight", AmbientLightConfig.deleteAmbientLightHook);

    Hooks.on("createTile", AmbientLightTileController.registerTileClickEvent);
}

function readyHook() {
    AmbientLightTileController.initTitles();
}

export * as register from "./hooks";
