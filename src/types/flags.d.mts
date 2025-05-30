import { flag } from "../scripts/constants/flag";

declare global {
    namespace AmbientLightDocument {
        interface Flags {
            "interactive-light": {
                "interactive": boolean;
                path: string;
                "tile-id": string;
            };
        }
    }

    namespace TileDocument {
        interface Flags {
            "interactive-light": {
                "light-id": string;
            };
        }
    }
}
