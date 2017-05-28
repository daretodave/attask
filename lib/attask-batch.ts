import {Task} from "./task";
import {AttaskPolicy} from "./attask-policy";
import {AttaskMode} from "./attask-mode";
import {AttaskState} from "./attask-state";
import {AttaskListener} from "./attask-listener";
import {AttaskTask} from "./attask-task";

export class AttaskBatch<P> {

    constructor(private tasks: Task<P>[],
                private policy: AttaskPolicy,
                private mode: () => AttaskMode,
                private errorListener: () => AttaskListener<P, any>,
                private onFailedHandler: (reason:any) => any,
                private silent: () => boolean) {
    }

    private error(message:any, task:Task<P>) {
        const handler:any = this.errorListener();

        if (!this.silent() && handler) {
            if(handler["onEvent"] && typeof handler.onEvent  === 'function') {
                handler.onEvent(message, task);
            } else {
                handler(message, task);
            }
        }
    };

    private finish(batch:AttaskTask<P>, isError: boolean, message: any, task: Task<P>) {
        if ((this.policy === AttaskPolicy.MUST && isError)
         || (this.policy === AttaskPolicy.WONT && !isError)) {
            this.error(message, task);

            this.onFailedHandler(message);

            batch.failed = true;
        } else if(this.policy === AttaskPolicy.MIGHT && isError) {

            this.error(message, task);
        }
    };

    private execute(
        batch:AttaskTask<P>,
        task: any
    ): Promise<any> {

        if (batch.failed) {
            return Promise.resolve();
        }

        let promise:Promise<any>;

        try {
            promise = task.call(task, batch.provider, batch.state);
        } catch (error) {
            if (error && error.name === 'TypeError') {
                return this.execute(batch, new task());
            }

            this.finish(batch, true, error, task);
        }

        return Promise.resolve(promise)
            .then(result => this.finish(batch, false, result, task))
            .catch(error => this.finish(batch, false, error, task));
    };

    run(provider: () => P, state: AttaskState): AttaskTask<P> {
        const attachment = provider();
        const batch = new AttaskTask(this.tasks, state, attachment);

        if (this.tasks.length === 0) {
            batch.promise = Promise.resolve(true);

            return batch;
        }

        let promise:Promise<any>;

        if (this.mode() === AttaskMode.SYNC) {
            promise = this.tasks.reduce((
                promise,
                task
            ) => promise.then(() => this.execute(
                batch,
                task
            )), Promise.resolve());
        } else {
            promise = Promise.all(this.tasks.map(task => this.execute(
                batch,
                task
            )))
        }

        batch.promise = promise.then(() => !batch.failed);

        return batch;
    }

}
