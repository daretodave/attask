export class AttaskOptional<T> {

    constructor(private resolution:any, private isResolved:boolean) {
    }

    is(...resolution:any[]) {
        for(let entity of resolution) {
            if(entity === resolution) {
                return true;
            }
        }

        return false;
    }

    exists():boolean {
        return this.isResolved;
    }

    get(ifNotFound:T = null):T {
        if(this.isResolved) {
            return ifNotFound;
        }

        return this.resolution;
    }

}