import { AmbientLightConfig } from "./ambient-light-config";
import { flag } from "./constants/flag";
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
    // Hooks.on("createToken", (ev: any) => {
    //     Logger.log("Token has created", ev);
    //     if (!(ev instanceof Token)) {
    //         Logger.log("It's not a token");
    //         return;
    //     }
    //     const token = ev as Token;
    //     Logger.log("It's a token");
    //     const lightId = token.document.getFlag(flag.scope, flag.lightIdName);
    //     if (lightId) {
    //         Logger.log(`It's a light token. Light ID [${lightId}]`);
    //         token.onclick = TokenInteractionManager.handleTokenClick;
    //     }
    // });
}

function readyHook() {
    TokenInteractionManager.init();
}

export * as register from "./hooks";
