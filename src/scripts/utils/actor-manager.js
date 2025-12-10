export class ActorManager {
    static getModuleActorType(systemId = game.system.id) {
        switch (systemId) {
            case "pf2e":
                return "hazard";
            default:
                return "base";
        }
    }
}