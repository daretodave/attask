export declare class AttaskOptional<T> {
    private resolution;
    private isResolved;
    constructor(resolution: any, isResolved: boolean);
    is(...resolution: any[]): boolean;
    exists(): boolean;
    get(ifNotFound?: T): T;
}
