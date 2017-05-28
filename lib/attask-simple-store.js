"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AttaskSimpleStore {
    constructor(source) {
        this.source = source;
    }
    set(key, entry) {
        this.source[key] = entry;
        return this;
    }
    remove(key) {
        delete this.source[key];
        return this;
    }
    keys() {
        return Object.keys(this.source);
    }
    resolve(key) {
        return this.source[key];
    }
    has(key) {
        return this.source.hasOwnProperty(key);
    }
}
exports.AttaskSimpleStore = AttaskSimpleStore;
//# sourceMappingURL=attask-simple-store.js.map