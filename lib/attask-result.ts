import {AttaskState} from "./attask-state";
import {AttaskTask} from "./attask-task";

export interface AttaskResult<P> {

    attachment:P;
    state:AttaskState;
    isError:boolean,
    error:any;
    tasks:AttaskTask<P>[];

}