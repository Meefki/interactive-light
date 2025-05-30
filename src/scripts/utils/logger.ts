// console colors
export const consoleColor1 = "color: #7bf542";
export const consoleColor2 = "color: #d8eb34";
export const consoleColor3 = "color: #ffffff";

export class Logger {
    public static log(...object: any) {
        console.log(
            `%c Interactive%cLight %c`,
            consoleColor1,
            consoleColor2,
            consoleColor3,
            ...object
        );
    }
}

export * as logger from "./logger";
