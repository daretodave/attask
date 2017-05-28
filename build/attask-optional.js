"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class AttaskOptional {
    constructor(resolution, isResolved) {
        this.resolution = resolution;
        this.isResolved = isResolved;
    }
    is(...resolution) {
        for (let entity of resolution) {
            if (entity === resolution) {
                return true;
            }
        }
        return false;
    }
    exists() {
        return this.isResolved;
    }
    get(ifNotFound = null) {
        if (this.isResolved) {
            return ifNotFound;
        }
        return this.resolution;
    }
}
exports.AttaskOptional = AttaskOptional;
//# sourceMappingURL=attask-optional.js.map