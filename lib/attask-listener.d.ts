import { Task } from "./task";
export interface AttaskListener<P, E> {
    onEvent(event: E, task: Task<P>): any;
}
