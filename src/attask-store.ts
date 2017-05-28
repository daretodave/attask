export interface AttaskStore {

    resolve<T>(key:string):T;

    has(key:string):boolean;

    set(key:string, entry:any):AttaskStore;

    remove(key:string):AttaskStore;

    keys():string[];

}