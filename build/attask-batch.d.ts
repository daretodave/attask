import { Task } from "./task";
import { AttaskPolicy } from "./attask-policy";
import { AttaskMode } from "./attask-mode";
import { AttaskState } from "./attask-state";
import { AttaskListener } from "./attask-listener";
import { AttaskTask } from "./attask-task";
export declare class AttaskBatch<P> {
    private tasks;
    private policy;
    private mode;
    private errorListener;
    private onFailedHandler;
    private silent;
    constructor(tasks: Task<P>[], policy: AttaskPolicy, mode: () => AttaskMode, errorListener: () => AttaskListener<P, any>, onFailedHandler: (reason: any) => any, silent: () => boolean);
    private error(message, task);
    private finish(batch, isError, message, task);
    private execute(batch, provider, state, task);
    run(provider: () => P, state: AttaskState): AttaskTask;
}
