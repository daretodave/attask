import {Task} from "./task";
import {AttaskState} from "./attask-state";

export class AttaskTask<P> {

    constructor(
        public tasks:Task<P>[],
        public state:AttaskState,
        public provider:P,
        public failed:boolean = false) {
    }

    promise:Promise<boolean>;

}