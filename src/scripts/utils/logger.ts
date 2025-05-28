import { cnt } from "./constants";

export class Logger {
    public static log(object: any) {
        console.log(`%c Interactive%cLight %c`, cnt.consoleColor1, cnt.consoleColor2, cnt.consoleColor3, object);
    }
}