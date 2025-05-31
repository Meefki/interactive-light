// console colors
const consoleColor1 = "color: #7bf542";
const consoleColor2 = "color: #d8eb34";
const consoleColor3 = "color: #ffffff";

export enum LogLevels {
    'debug' = 0,
    'info' = 1,
    'warn' = 2,
    'error' = 3
}

export class Logger {
    public static minLogLevel: LogLevels = LogLevels.debug;

    public static log(...object: any) {
        if (this.minLogLevel > LogLevels.debug) return;

        console.log(
            `%c Interactive%cLight %c`,
            consoleColor1,
            consoleColor2,
            consoleColor3,
            ...object
        );
    }

    public static info(...object: any) {
        if (this.minLogLevel > LogLevels.info) return;

        console.info(
            `%c Interactive%cLight %c`,
            consoleColor1,
            consoleColor2,
            consoleColor3,
            ...object
        )
    }

    public static warn(...object: any) {
        if (this.minLogLevel > LogLevels.warn) return;

        console.warn(
            `%c Interactive%cLight %c`,
            consoleColor1,
            consoleColor2,
            consoleColor3,
            ...object
        )
    }

    public static error(...object: any) {
        if (this.minLogLevel > LogLevels.error) return;

        console.error(
            `%c Interactive%cLight %c`,
            consoleColor1,
            consoleColor2,
            consoleColor3,
            ...object
        );
    }
}

export * as logger from "./logger";
