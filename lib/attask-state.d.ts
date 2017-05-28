import { AttaskStore } from "./attask-store";
import { AttaskOptional } from "./attask-optional";
export declare class AttaskState implements AttaskStore {
    source: AttaskStore;
    set(key: string, entry: any): AttaskStore;
    remove(key: string): AttaskStore;
    keys(): string[];
    collect<T>(...key: string[]): T[];
    hasAny(...keys: string[]): boolean;
    hasNone(...keys: string[]): boolean;
    hasAll(...keys: string[]): boolean;
    has(key: string): boolean;
    resolve<T>(key: string): T;
    get<T>(key: string, ifNotFound?: T): {};
    any<T>(...keys: any[]): AttaskOptional<T>;
    all<T>(...keys: any[]): AttaskOptional<T>[];
    static isStore(store: AttaskStore | any): store is AttaskStore;
    constructor(source: AttaskStore | any);
    absorb(source: AttaskStore | any): void;
}
