import { AttaskStore } from "./attask-store";
export declare class AttaskSimpleStore implements AttaskStore {
    private source;
    constructor(source: any);
    set(key: string, entry: any): AttaskStore;
    remove(key: string): AttaskStore;
    keys(): string[];
    resolve<T>(key: string): T;
    has(key: string): boolean;
}
