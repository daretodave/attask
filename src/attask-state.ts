import {AttaskStore} from "./attask-store";
import {AttaskOptional} from "./attask-optional";
import {AttaskSimpleStore} from "./attask-simple-store";

export class AttaskState implements AttaskStore {

    public source:AttaskStore;

    set(key: string, entry: any):AttaskStore {
        this.source.set(key, entry);
        return this;
    }

    remove(key: string):AttaskStore {
        this.source.remove(key);
        return this;
    }

    keys(): string[] {
        return this.source.keys();
    }


    collect<T>(...key:string[]):T[] {
        return key.map(_key => this.resolve<T>(_key));
    }

    hasAny(...keys:string[]):boolean {
        for(const key of keys) {
            if(this.source.has(key)) {
                return true;
            }
        }

        return false;
    }

    hasNone(...keys:string[]):boolean {
        for(const key of keys) {
            if(this.source.has(key)) {
                return false;
            }
        }

        return true;
    }

    hasAll(...keys:string[]):boolean {
        for(const key of keys) {
            if(!this.source.has(key)) {
                return false;
            }
        }

        return true;
    }

    has(key: string) {
        return this.source.has(key);
    }

    resolve<T>(key:string):T {
        return this.source.resolve<T>(key);
    }

    get<T>(key: string, ifNotFound?: T) {
        if(!this.source.has(key)) {
            return ifNotFound;
        }

        return this.source.resolve(key);
    }

    any<T>(...keys):AttaskOptional<T> {
        for(const key of keys) {
            if(this.source.has(key)) {
                return new AttaskOptional<T>(this.source.resolve(key), true);
            }

        }

        return new AttaskOptional<T>(null, false);
    }

    all<T>(...keys):AttaskOptional<T>[] {
        return keys.map(key => this.any<T>(key));
    }


    static isStore(store: AttaskStore | any): store is AttaskStore {
        const assert:AttaskStore = <AttaskStore>store;

        return assert.has !== undefined
            && assert.resolve !== undefined
            && assert.set !== undefined
            && assert.remove !== undefined
            && assert.keys !== undefined;
    }

    constructor(source:AttaskStore|any) {
        source = source || {};

        if(AttaskState.isStore(source)) {
            this.source = source;
        } else {
            this.source = new AttaskSimpleStore(source);
        }
    }


    absorb(source: AttaskStore | any) {

        if(AttaskState.isStore(source)) {
            const keys = source.keys();

            keys.forEach(key => this.set(key, source.resolve(key)));
        } else {
            const keys  = Object.keys(source);

            keys.forEach(key => this.set(key, source[key]));
        }


    }

}
