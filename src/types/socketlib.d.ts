// declare global {}

declare const socketlib: {
  registerModule(name: string): {
    register(name: string, func: (...args: any[]) => any): void;
    executeAsGM(name: string, ...args: any[]): Promise<any>;
    executeAsUser(name: string, userId: string, ...args: any[]): Promise<any>;
  };
  modules: Map<string, any>;
};
