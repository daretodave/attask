import { Task } from "./task";
import { AttaskState } from "./attask-state";
export declare class AttaskTask<P> {
    tasks: Task<P>[];
    state: AttaskState;
    provider: P;
    failed: boolean;
    constructor(tasks: Task<P>[], state: AttaskState, provider: P, failed?: boolean);
    promise: Promise<boolean>;
}
