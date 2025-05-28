import { Logger } from "./utils/logger";

export class Switcher {
    public static lightClickLeftCallback(event: Event | PIXI.FederatedEvent, ...args: any) {
        Logger.log(event);
        Logger.log(args);

        return true;
    }
}