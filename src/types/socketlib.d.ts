declare const socketlib: {
    registerModule(name: string): void;
    registerSystem(systemId: string): void;
    modules: Map<string, SocketlibSocket>;
};

declare class SocketlibSocket {
    public register(name: string, func: (...args: any[]) => any): void;
    public executeAsGM(name: string, ...args: any[]): Promise<any>;
    public executeAsUser(name: string, userId: string, ...args: any[]): Promise<any>;
}

// declare const SocketlibSocket: SocketlibSocket = {
//     register(name: string, func: (...args: any[]) => any): void;
//     executeAsGM(name: string, ...args: any[]): Promise<any>;
//     executeAsUser(name: string, userId: string, ...args: any[]): Promise<any>;
// };
