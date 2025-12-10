import { Logger } from "./logger.js";

export class LibManager {
    static checkLibWrapper() {
        if (!game.modules?.get("lib-wrapper")?.active) {
            Logger.error("LibWrapper is not active!");
            return false;
        }

        return true;
    }

    static checkSocketLib() {
        if (!game.modules?.get("socketlib")?.active) {
            Logger.error("Socketlib is not active!");
            return false;
        }

        return true;
    }
}