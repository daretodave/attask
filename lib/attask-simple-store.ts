import {AttaskStore} from "./attask-store";

export class AttaskSimpleStore implements AttaskStore {

    constructor(private source:any) {
    }

    set(key: string, entry: any): AttaskStore {
        this.source[key] = entry;
        return this;
    }

    remove(key: string): AttaskStore {
        delete this.source[key];
        return this;
    }

    keys(): string[] {
        return Object.keys(this.source);
    }

    resolve<T>(key: string):T {
        return this.source[key];
    }

    has(key: string):boolean {
        return this.source.hasOwnProperty(key);
    }

}