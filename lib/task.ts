import {AttaskState} from "./attask-state";

export type TaskerTask<P> = Task<P> | any;

export interface Task<P> {

    run(provider?:P, state?:AttaskState):Promise<any>|any;

}