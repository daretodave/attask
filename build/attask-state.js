"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const attask_optional_1 = require("./attask-optional");
const attask_simple_store_1 = require("./attask-simple-store");
class AttaskState {
    set(key, entry) {
        this.source.set(key, entry);
        return this;
    }
    remove(key) {
        this.source.remove(key);
        return this;
    }
    keys() {
        return this.source.keys();
    }
    collect(...key) {
        return key.map(_key => this.resolve(_key));
    }
    hasAny(...keys) {
        for (const key of keys) {
            if (this.source.has(key)) {
                return true;
            }
        }
        return false;
    }
    hasNone(...keys) {
        for (const key of keys) {
            if (this.source.has(key)) {
                return false;
            }
        }
        return true;
    }
    hasAll(...keys) {
        for (const key of keys) {
            if (!this.source.has(key)) {
                return false;
            }
        }
        return true;
    }
    has(key) {
        return this.source.has(key);
    }
    resolve(key) {
        return this.source.resolve(key);
    }
    get(key, ifNotFound) {
        if (!this.source.has(key)) {
            return ifNotFound;
        }
        return this.source.resolve(key);
    }
    any(...keys) {
        for (const key of keys) {
            if (this.source.has(key)) {
                return new attask_optional_1.AttaskOptional(this.source.resolve(key), true);
            }
        }
        return new attask_optional_1.AttaskOptional(null, false);
    }
    all(...keys) {
        return keys.map(key => this.any(key));
    }
    static isStore(store) {
        const assert = store;
        return assert.has !== undefined
            && assert.resolve !== undefined
            && assert.set !== undefined
            && assert.remove !== undefined
            && assert.keys !== undefined;
    }
    constructor(source) {
        source = source || {};
        if (AttaskState.isStore(source)) {
            this.source = source;
        }
        else {
            this.source = new attask_simple_store_1.AttaskSimpleStore(source);
        }
    }
    absorb(source) {
        if (AttaskState.isStore(source)) {
            const keys = source.keys();
            keys.forEach(key => this.set(key, source.resolve(key)));
        }
        else {
            const keys = Object.keys(source);
            keys.forEach(key => this.set(key, source[key]));
        }
    }
}
exports.AttaskState = AttaskState;
//# sourceMappingURL=attask-state.js.map