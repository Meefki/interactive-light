import { flag } from "../scripts/constants/flag";

declare global {
    namespace AmbientLightDocument {
        interface Flags {
            [flag.scope]: {
                [flag.interactiveName]: boolean,
                [flag.pathName]: string,
                [flag.tileIdName]: string,
                [flag.actorIdName]: string,
                [flag.tokenIdName]: string,
            }
        }
    }

    namespace TileDocument {
        interface Flags {
            [flag.scope]: {
                [flag.lightIdName]: string
            }
        }
    }

    namespace TokenDocument {
        interface Flags {
            [flag.scope]: {
                [flag.lightIdName]: string
            }
        }
    }
}
