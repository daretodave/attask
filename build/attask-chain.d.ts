import { AttaskPolicy } from "./attask-policy";
import { AttaskMode } from "./attask-mode";
import { AttaskListener } from "./attask-listener";
import { AttaskState } from "./attask-state";
import { AttaskResult } from "./attask-result";
export declare class AttaskChain<P> {
    private provider;
    private configuration;
    private mode;
    private errorListener;
    private silent;
    private map;
    constructor(provider: () => P, configuration: () => AttaskState, mode: () => AttaskMode, errorListener: () => AttaskListener<P, any>, silent: () => boolean);
    push(policy: AttaskPolicy, ...tasks: any[]): void;
    resolve(completeListener?: AttaskListener<P, AttaskResult<P>>): Promise<boolean>;
}
